import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// Chart.js registrations: ensure controllers/types are registered for ng2-charts
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
