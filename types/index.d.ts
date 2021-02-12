declare type genericObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

declare type populatedObject = {
  path: string;
  model: string;
  select?: string;
};
