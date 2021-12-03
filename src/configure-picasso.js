import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import picassoHammer from 'picasso-plugin-hammer';
import Hammer from 'hammerjs';
import webglRenderer from './webgl-renderer';
import reactRenderer from './picasso-components/react-components/react-renderer';
import refLineLabelsComponent from './picasso-components/ref-line-labels';
import pointLabelComponent from './picasso-components/point-label';
import disclaimer from './picasso-components/react-components/disclaimer';
import miniChartWindow from './picasso-components/mini-chart-window';
import dataTitle from './picasso-components/react-components/data-title-component';
import basicPoint from './picasso-components/basic-point';

export default function configurePicasso() {
  const picasso = picassojs();

  picasso.use(picassoQ);
  picasso.use(picassoHammer(Hammer));

  picasso.renderer('react', reactRenderer());
  picasso.renderer('webgl', webglRenderer);
  picasso.component('reference-line-labels', refLineLabelsComponent);
  picasso.component('point-label', pointLabelComponent);
  picasso.component('disclaimer', disclaimer());
  picasso.component('mini-chart-window', miniChartWindow);
  picasso.component('data-title', dataTitle());
  picasso.component('basic-point', basicPoint());

  return picasso;
}
