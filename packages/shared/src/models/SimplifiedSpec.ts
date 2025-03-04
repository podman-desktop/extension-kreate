export interface SimplifiedSpec {
  name: string;
  type: string;
  isArray: boolean;
  description: string;
  typeDescription: string;
  children: SimplifiedSpec[];
}
