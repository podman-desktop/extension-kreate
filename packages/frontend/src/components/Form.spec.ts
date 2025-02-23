import { expect, test, vi } from 'vitest';
import Form from './Form.svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';

vi.mock('/@/api/client', () => ({
  kreateApiClient: {
    getCommands: vi.fn(),
    getCommandDetails: vi.fn(),
  },
}));

test('command with args', async () => {
  const commandDetails = {
    name: 'cmd1',
    args: [
      {
        name: 'arg1',
        label: 'Arg 1',
        description: 'First Arg',
        required: true,
      },
      {
        name: 'arg2',
        label: 'Arg 2',
        description: 'Second Arg',
        required: true,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const arg1 = screen.getByRole('textbox', { name: 'Arg 1' });
    await user.type(arg1, 'value 1');
  });

  const arg2 = screen.getByRole('textbox', { name: 'Arg 2' });
  await user.type(arg2, 'value 2');

  await vi.waitFor(() => {
    expect(onArgsChangeMock).toHaveBeenCalledWith(['value 1', 'value 2']);
  });
});

test('command with multiple key-value flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'key-value',
        label: 'aflag',
        description: 'a flag',
        multiple: true,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  await vi.waitFor(async () => {
    const addBtn = screen.getByRole('button', { name: 'add-btn' });
    await fireEvent.click(addBtn);
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const keyInputs = screen.getAllByPlaceholderText('key');
    expect(keyInputs).toHaveLength(2);
    await user.type(keyInputs[0], 'key1');
    await user.type(keyInputs[1], 'key2');
  });
  const valueInputs = screen.getAllByPlaceholderText('value');
  expect(valueInputs).toHaveLength(2);
  await user.type(valueInputs[0], 'value1');
  await user.type(valueInputs[1], 'value2');

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'key1=value1', 'key2=value2']]);
  });
});

test('command with single text flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'string',
        label: 'aflag',
        description: 'a flag',
        multiple: false,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const arg1 = screen.getByRole('textbox');
    await user.type(arg1, 'value 1');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'value 1']]);
  });
});

test('command with multiple string flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'string',
        label: 'aflag',
        description: 'a flag',
        multiple: true,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  await vi.waitFor(async () => {
    const addBtn = screen.getByRole('button', { name: 'add-btn' });
    await fireEvent.click(addBtn);
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    await user.type(inputs[0], 'value1');
    await user.type(inputs[1], 'value2');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'value1', 'value2']]);
  });
});

test('command with single password flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'password',
        label: 'aflag',
        description: 'a flag',
        multiple: false,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByLabelText('password option--flag1');
    user.type(input, 'a-value');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'a-value']]);
  });
});

test('command with single file flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'file',
        label: 'aflag',
        description: 'a flag',
        multiple: false,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByRole('textbox');
    user.type(input, 'a-value');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'a-value']]);
  });
});

test('command with multiple file flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'file',
        label: 'aflag',
        description: 'a flag',
        multiple: true,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  await vi.waitFor(async () => {
    const addBtn = screen.getByRole('button', { name: 'add-btn' });
    await fireEvent.click(addBtn);
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    await user.type(inputs[0], 'value1');
    await user.type(inputs[1], 'value2');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'value1', 'value2']]);
  });
});

test('command with multiple key-file flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'key-fileOrDirectory',
        label: 'aflag',
        description: 'a flag',
        multiple: true,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  await vi.waitFor(async () => {
    const addBtn = screen.getByRole('button', { name: 'add-btn' });
    await fireEvent.click(addBtn);
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const keyInputs = screen.getAllByPlaceholderText('key');
    expect(keyInputs).toHaveLength(2);
    await user.type(keyInputs[0], 'key1');
    await user.type(keyInputs[1], 'key2');
  });
  const valueInputs = screen.getAllByRole('textbox', { name: 'file-select' });
  expect(valueInputs).toHaveLength(2);
  await user.type(valueInputs[0], 'value1');
  await user.type(valueInputs[1], 'value2');

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', 'key1=value1', 'key2=value2']]);
  });
});

test('command with single boolean flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'boolean',
        label: 'aflag',
        description: 'a flag',
        multiple: false,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  await vi.waitFor(async () => {
    const input = screen.getByRole('checkbox');
    await fireEvent.click(input);
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1=true']]);
  });
});

test('command with single number flag', async () => {
  const commandDetails: CommandDetails = {
    name: 'cmd1',
    options: [
      {
        flag: '--flag1',
        type: 'number',
        label: 'aflag',
        description: 'a flag',
        multiple: false,
      },
    ],
  };
  const onOptionsChangeMock = vi.fn();
  const onArgsChangeMock = vi.fn();

  render(Form, {
    details: commandDetails,
    onArgsChange: onArgsChangeMock,
    onOptionsChange: onOptionsChangeMock,
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByRole('textbox');
    user.type(input, '{backspace}45');
  });

  await vi.waitFor(() => {
    expect(onOptionsChangeMock).toHaveBeenCalledWith([['--flag1', '45']]);
  });
});
