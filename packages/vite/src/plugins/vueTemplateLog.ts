import { Plugin } from 'vite';
import fs from 'node:fs';
import { VueTemplateLogOptions } from '@mwork-plugins/types';
import { addTemplateEventLog } from '@mwork-plugins/helpers';

export function vueTemplateLog(options: VueTemplateLogOptions): Plugin {
  return {
    name: 'vue-template-log',
    load(id: string) {
      if (options.enable && Array.isArray(options.events) && id.endsWith('.vue')) {
        try {
          const source = fs.readFileSync(id, {
            encoding: 'utf-8'
          });
          const result = addTemplateEventLog(source, id, options.events);

          return {
            code: result
          };
        } catch (e) {
          console.log(e);
        }
      }
    }
  };
}
