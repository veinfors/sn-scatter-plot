/* eslint-disable no-param-reassign */
import KEYS from '../../../constants/keys';
import createSizeScale from '../../scales/size';
import createBrush from '../../brush';
import movePath from '../../../utils/move-path';

export default function createPoint({ layoutService, colorService, chartModel }) {
  let windowSizeMultiplier;
  const sizeScaleFn = createSizeScale(layoutService);
  const viewHandler = chartModel.query.getViewHandler();
  const dataHandler = chartModel.query.getDataHandler();
  const { transform } = viewHandler;
  const useWebGL = layoutService.getLayoutValue('useWebGL', false);

  KEYS.COMPONENT.POINT = `point-component${useWebGL ? '-webgl' : '-canvas'}`;

  return {
    key: KEYS.COMPONENT.POINT,
    type: useWebGL ? 'basic-point' : 'point',
    renderer: useWebGL ? 'webgl' : 'canvas',
    data: {
      collection: KEYS.COLLECTION.MAIN,
    },
    show: () => !dataHandler.getMeta().isBinnedData,
    brush: createBrush(),
    settings: {
      x: {
        scale: KEYS.SCALE.X,
      },
      y: {
        scale: KEYS.SCALE.Y,
      },
      size: (d) => sizeScaleFn(d, windowSizeMultiplier) || '8px',
      fill: colorService.getColor(),
      // opacity: 0.8,
      strokeWidth: 0.5,
      stroke: '#fff',
      shape: (d) => (sizeScaleFn(d, windowSizeMultiplier) ? 'circle' : 'saltire'),
    },
    beforeRender: ({ size }) => {
      windowSizeMultiplier = Math.min(size.height, size.width) / 300;
    },
    // animations: {
    //   enabled: () => viewHandler.animationEnabled,
    //   compensateForLayoutChanges({ currentNodes, currentRect, previousRect }) {
    //     if (currentRect.x !== previousRect.x) {
    //       const deltaX = currentRect.x - previousRect.x;
    //       currentNodes.forEach((node) => {
    //         switch (node.type) {
    //           case 'circle':
    //             node.cx -= deltaX;
    //             break;
    //           case 'path': {
    //             node.d = movePath(node.d, -deltaX);
    //             break;
    //           }
    //           default:
    //             break;
    //         }
    //       });
    //     }
    //   },
    // },
    // rendererSettings: {
    //   transform,
    //   canvasBufferSize: (rect) => ({
    //     width: rect.computedPhysical.width + 100,
    //     height: rect.computedPhysical.height + 100,
    //   }),
    // },
  };
}
