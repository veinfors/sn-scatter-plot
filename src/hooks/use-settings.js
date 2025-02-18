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
import { initializeViewState, updateViewState } from './view-state';

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

    const { layoutService, chartModel, colorService, pluginService } = models;
    const { viewState } = core;
    const viewHandler = chartModel.query.getViewHandler();
    const logicalSize = getLogicalSize({ layout: layoutService.getLayout(), options });

    return viewHandler.fetchData().then((pages) => {
      layoutService.setDataPages(pages);
      return pluginService.initialize().then(() =>
        colorService.initialize().then(() => {
          colorService.custom.updateBrushAliases();
          colorService.custom.updateLegend();
          const newSettings = getPicassoDef(logicalSize);
          chartModel.command.layoutComponents({ settings: newSettings });
          initializeViewState({ viewState, viewStateOptions: options.viewState, models });
          setSettings(newSettings);
        })
      );
    });
  }, [models]);

  useEffect(() => {
    if (!models) {
      return;
    }

    const { layoutService, chartModel, dockService, colorService } = models;
    const { viewState } = core;
    const logicalSize = getLogicalSize({ layout: layoutService.getLayout(), options });
    dockService.update(logicalSize || rect);
    colorService.custom.updateLegend();

    const newSettings = getPicassoDef(logicalSize || rect);
    chartModel.command.layoutComponents({ settings: newSettings });
    updateViewState({ viewState, viewStateOptions: options.viewState, models });
    setSettings(newSettings);
  }, [rect.width, rect.height, constraints]);

  return settings;
};

export default useSettings;
