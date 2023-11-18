import loaderUtils from 'loader-utils';
import { LoaderContext } from 'webpack';
import { VueTemplateLogOptions } from '@mwork-plugins/types';
import { addTemplateEventLog } from '@mwork-plugins/helpers';

/**
 * @description 为 vue template 组件增加 log。
 * @param this
 * @param source
 */
export default function VueTemplateLog(this: LoaderContext<VueTemplateLogOptions>, source: string) {
  const loaderContext = this;
  const loaderOptions = this?.getOptions
    ? this.getOptions()
    : (loaderUtils.getOptions(this as any) as unknown as VueTemplateLogOptions);

  if (!loaderOptions.enable) {
    return source;
  }

  if (!Array.isArray(loaderOptions.events)) {
    return source;
  }

  const { resourcePath, resourceQuery } = loaderContext;

  // 没有参数 和 参数中不包含 script 的话，直接返回。
  if (!resourceQuery.length && !resourceQuery.includes('?vue&type=script')) {
    return source;
  }

  const result = addTemplateEventLog(source, resourcePath, loaderOptions.events);

  return result;
}
