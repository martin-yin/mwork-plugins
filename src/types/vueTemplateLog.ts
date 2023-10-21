export type VueTemplateLogOptions = {
  enable: boolean;
  events: Array<string>;
};

export type VueTemplateEvent = {
  event: string;
  method: string;
};

export type VueTemplateEvents = Array<VueTemplateEvent>;
