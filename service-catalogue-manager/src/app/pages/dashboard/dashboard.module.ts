import { NgModule } from '@angular/core';
import { NbCardModule, NbIconModule } from '@nebular/theme';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { StatusCardComponent } from './status-card/status-card.component';
import { AvailableServicesService } from '../services/availableServices/availableServices.service';
import { CategoryPieComponent } from './charts/categoryPie.component';
import { TranslateModule } from '@ngx-translate/core';
import { AvailableAdaptersService } from '../services/available-adapters/available-adapters.service';

const components = [DashboardComponent, StatusCardComponent, CategoryPieComponent];

@NgModule({
  imports: [NbCardModule, ThemeModule, NgxChartsModule, NbIconModule, TranslateModule],
  declarations: [...components],
  providers: [AvailableServicesService],
})
export class DashboardModule {}
