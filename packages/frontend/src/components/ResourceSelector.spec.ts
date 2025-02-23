import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import ResourceSelector from './ResourceSelector.svelte';
import * as client from '../api/client';
import userEvent from '@testing-library/user-event';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';

vi.mock('/@/api/client', () => ({
  kreateApiClient: {
    getCommands: vi.fn(),
    getCommandDetails: vi.fn(),
  },
}));

test('todo', async () => {
  const onselectedMock = vi.fn();
  const oncreateMock = vi.fn();

  // cmd1 has subcommands
  // cmd2 is a final command
  vi.mocked(client.kreateApiClient.getCommands).mockImplementation(async (parent?: string) => {
    if (!parent) {
      return ['cmd1', 'cmd2'];
    } else if (parent === 'cmd1') {
      return ['cmd1sub1', 'cmd1sub2'];
    } else {
      return [];
    }
  });
  const commandDetails = {
    name: 'cmd1sub1',
  } as unknown as CommandDetails;
  vi.mocked(client.kreateApiClient.getCommandDetails).mockImplementation(async (_cmd: string[]) => {
    return commandDetails;
  });

  render(ResourceSelector, {
    onselected: onselectedMock,
    oncreate: oncreateMock,
  });

  await vi.waitFor(() => {
    const commandDropdown = screen.getByRole('button', { name: 'Resource to create:' });
    commandDropdown.focus();
  });

  await userEvent.keyboard('[ArrowDown][Arrowdown][Enter]'); // select cmd1

  expect(onselectedMock).not.toHaveBeenCalled();

  const subcommandDropdown = screen.getByRole('button', { name: '(select a resource type)' });
  subcommandDropdown.focus();
  await userEvent.keyboard('[ArrowDown][Arrowdown][Enter]'); // select cmd1sub1

  expect(onselectedMock).toHaveBeenCalledWith(commandDetails);

  expect(oncreateMock).not.toHaveBeenCalled();

  const viewButton = screen.getByRole('button', { name: 'view-yaml' });
  await fireEvent.click(viewButton);

  expect(oncreateMock).toHaveBeenCalled();
});
