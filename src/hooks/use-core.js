import { useElement, useEffect, useState, useOptions } from '@nebula.js/stardust';
import useActions from './use-actions';
import useViewState from './use-view-state';
import configurePicasso from '../configure-picasso';

const useCore = ({ flags }) => {
  const element = useElement();
  const options = useOptions();
  const actions = useActions({ flags });
  const viewState = useViewState();

  const [core, setCore] = useState();

  useEffect(() => {
    if (!viewState) return undefined;

    element.style.overflow = 'hidden';
    const picasso = configurePicasso();
    const picassoInstance = picasso({
      renderer: { prio: [options.renderer || 'svg'] },
    });

    const chart = picassoInstance.chart({
      element,
      data: [],
      settings: {},
    });

    setCore({
      picassoInstance,
      chart,
      actions,
      viewState,
    });

    return () => {
      chart.destroy();
    };
  }, [viewState]);

  return core;
};

export default useCore;
