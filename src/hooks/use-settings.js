import {
  useState,
  useModel,
  usePromise,
  useTheme,
  useOptions,
  useConstraints,
  useTranslator,
  useSelections,
  useEffect,
  useRect,
} from '@nebula.js/stardust';
import createPicassoDefinition from '../picasso-definition';
import getLogicalSize from '../logical-size';
import { initializeViewState, updateViewState } from './viewstate';

const useSettings = ({ core, models, flags }) => {
  const rect = useRect();
  const [settings, setSettings] = useState();
  const model = useModel();
  const theme = useTheme();
  const options = useOptions();
  const constraints = useConstraints();
  const translator = useTranslator();
  const selections = useSelections();

  const getPicassoDef = (logicalSize) =>
    createPicassoDefinition({
      core,
      models,
      model,
      theme,
      options,
      constraints,
      selections,
      translator,
      logicalSize,
      flags,
    });

  usePromise(() => {
    if (!models) {
      return Promise.resolve();
    }

    const { layoutService, chartModel, colorService, tickModel, extremumModel } = models;
    const { viewState } = core;
    const zoomHandler = chartModel.query.getZoomHandler();
    const logicalSize = getLogicalSize({ layout: layoutService.getLayout(), options });
    initializeViewState(viewState, layoutService, options.viewState, tickModel, chartModel, extremumModel);

    return zoomHandler.fetchData().then((pages) => {
      layoutService.setDataPages(pages);
      return colorService.initialize().then(() => {
        colorService.custom.updateBrushAliases();
        colorService.custom.updateLegend();
        setSettings(getPicassoDef(logicalSize));
      });
    });
  }, [models]);

  useEffect(() => {
    if (!models) {
      return;
    }

    const { layoutService, chartModel, dockService, tickModel, colorService, extremumModel } = models;
    const { viewState } = core;
    const zoomHandler = chartModel.query.getZoomHandler();
    const logicalSize = getLogicalSize({ layout: layoutService.getLayout(), options });
    dockService.update(logicalSize || rect);
    colorService.custom.updateLegend();
    zoomHandler.update();

    // It is important that the viewstate should be updated only after the dockService has updated the rect
    updateViewState(viewState, layoutService, options.viewState, tickModel, chartModel, extremumModel);
    zoomHandler.fetchData().then((pages) => {
      layoutService.setDataPages(pages);
      setSettings(getPicassoDef(logicalSize));
    });
  }, [rect.width, rect.height]);

  return settings;
};

export default useSettings;
