/* eslint-disable @typescript-eslint/no-unsafe-call */
import { LocalDataSource } from 'ng2-smart-table';
//import { CatalogueInfoRenderComponent } from './catalogue-info-render/catalogue-info-render.component';//TODO
import { TranslateService } from '@ngx-translate/core';
import { NgxConfigureService } from 'ngx-configure';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CatalogueDataset } from '../../../../model/catalogue/catalogueDataset';
import { ManageConfigurationsService } from '../../manage-configurations/manage-configurations.service';
import { AvailableCataloguesService } from '../../availableCatalogues/availableCatalogues.service';
import { CatalogueEntry } from 'c:/Users/Demetrix/Downloads/Repository/Service-Catalogue/service-catalogue-manager/src/app/model/catalogue/catalogueEntry';
import { ActionsCatalogueMenuRenderComponent } from '../../availableCatalogues/actions-catalogue-menu-render/actions-catalogue-menu-render.component';
import { AppConfig, System } from '../../../../model/appConfig';
import { AvailableServicesService } from '../../../services/availableServices/availableServices.service';
import { FederateCatalogueComponent } from '../federate-catalogue/federate-catalogue.component';
import { ActionsFederateComponent } from './actions-federate/actions-federate.component';
import { InfoRenderRemoteCatalogueComponent } from '../info-render-remote-catalogue/info-render-remote-catalogue.component';

@Component({
  selector: 'remote-catalogues-select',
  templateUrl: './remote-catalogues-select.component.html',
  styleUrls: ['./remote-catalogues-select.component.css']
})
export class RemoteCataloguesSelectComponent implements OnInit, OnChanges {
  @Input() selectedDatasetName: string;
  @Output() updateResult = new EventEmitter<unknown>();

  //selectedDatasetName: string;

  schemaDir: string;
  loading = false;
  public isNew = false;
  private systemLocale: string;
  public serviceId: string;
  public catalogueID: string;
  public serviceName: string;
  public readOnly = false;
  private nameLabel: string;
  private countryLabel: string;
  private actionsLabel: string;
  private infoLabel: string;
  private statusLabel: string;
  private activeLabel: string;
  private servicesLabel: string;
  public settings: Record<string, unknown>;
  private locale: string;
  public source: LocalDataSource = new LocalDataSource();
  private unsubscribe: Subject<void> = new Subject();
  homePageLabel: string;
  datasets: CatalogueDataset[];
  selectedDataset: CatalogueDataset;
  availableCatalogues: CatalogueEntry[];



  //selectedDatasetName: string;

  private systemConfig: System;
  private config: AppConfig;
  detailsLabel: string;
  //availableCatalogues: CatalogueEntry[];

  constructor(
    private availableCatalogueDatasetsService: ManageConfigurationsService,
    private availableCataloguesService: AvailableCataloguesService,
    private translate: TranslateService,
    private configService: NgxConfigureService,
    private dialogService: NbDialogService,
    private availableServicesService: AvailableServicesService,
  ) {
    this.config = this.configService.config as AppConfig;
    this.systemConfig = this.config.system;
    this.systemLocale = this.config.i18n.locale;
    this.settings = this.loadTableSettings();
    this.locale = (this.configService.config as AppConfig).i18n.locale; // TODO change with user language preferences
    this.schemaDir =
      (this.systemConfig.serviceEditorUrl.includes('localhost') ? '' : this.systemConfig.serviceEditorUrl) +
      this.systemConfig.editorSchemaPath +
      '/' +
      this.systemLocale +
      '/' +
      this.systemConfig.editorSchemaName;
    this.loading = true;
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.datasets) this.datasets = await this.availableCatalogueDatasetsService.getCatalogueDatasets()
    if (!this.selectedDataset) this.selectedDataset = this.datasets[0];
    if (!this.selectedDatasetName) this.selectedDatasetName = this.selectedDataset.name
    //console.log("changes ", changes['selectedDatasetName'])
    //console.log("changes ", changes['selectedDatasetName'].currentValue)
    this.selectedDataset = this.datasets.filter(dataset => dataset.name == changes['selectedDatasetName'].currentValue)[0]// || this.datasets[0]
    //for (let i in this.selectedDataset) console.log(this.datasets.filter(dataset => dataset.name == changes['selectedDatasetName'].currentValue)[0][i])//console.log(i, "", this.selectedDataset[i])
    try { this.availableCatalogues = await this.availableCataloguesService.getRemoteCatalogues(this.selectedDataset.URL); }
    catch { this.availableCatalogues = [] }
    let notfederatedCatalogues: CatalogueEntry[] = [];
    for (let remoteCatalogue of this.availableCatalogues) {
      let cataloguesAlreadyFedarated = await this.availableCataloguesService.getCatalogue(remoteCatalogue.catalogueID);
      console.log("get catalogue by catalogue ID", cataloguesAlreadyFedarated)
      if (cataloguesAlreadyFedarated)
        //if (cataloguesAlreadyFedarated[0].catalogueID) {
        console.log("******temp[0].catalogueID*******", cataloguesAlreadyFedarated.catalogueID)
      //}
      else {
        notfederatedCatalogues.push(remoteCatalogue)
      }
    }
    console.log("NOT FEDERATED CATALOGUES ", notfederatedCatalogues)
    void await this.source.load(notfederatedCatalogues);
    this.updateResult.emit(this.availableCatalogues);
  }

  async ngOnInit() {
    if (!this.datasets) this.datasets = await this.availableCatalogueDatasetsService.getCatalogueDatasets()
    if (!this.selectedDataset) this.selectedDataset = this.datasets[0];
    if (!this.selectedDatasetName) this.selectedDatasetName = this.selectedDataset.name
    //console.log("changes ", changes['selectedDatasetName'])
    //console.log("changes ", changes['selectedDatasetName'].currentValue)
    //for (let i in this.selectedDataset) console.log(this.datasets.filter(dataset => dataset.name == changes['selectedDatasetName'].currentValue)[0][i])//console.log(i, "", this.selectedDataset[i])
    this.availableCatalogues = await this.availableCataloguesService.getRemoteCatalogues(this.selectedDataset.URL);
    void await this.source.load(this.availableCatalogues);
    this.updateResult.emit(this.availableCatalogues);

  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadTableSettings(): Record<string, unknown> {
    this.nameLabel = this.translate.instant('general.catalogues.name') as string;
    this.homePageLabel = this.translate.instant('general.catalogues.home_page') as string;
    this.countryLabel = this.translate.instant('general.catalogues.country') as string;
    this.actionsLabel = this.translate.instant('general.catalogues.actions') as string;
    this.infoLabel = this.translate.instant('general.catalogues.details') as string;
    this.statusLabel = this.translate.instant('general.catalogues.status') as string;
    this.activeLabel = this.translate.instant('general.catalogues.active') as string;
    this.servicesLabel = this.translate.instant('general.catalogues.services') as string;
    this.detailsLabel = this.translate.instant('general.catalogues.details') as string;

    return {
      mode: 'external',
      attr: {
        class: 'table table-bordered',
      },
      actions: {
        add: false,
        edit: false,
        delete: false,
        editService: false
      },

      columns: {
        name: {
          title: this.nameLabel,
          type: 'text',
          width: '25%',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row.name,
        },
        country: {
          title: this.countryLabel,
          type: 'text',
          width: '25%',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row.country,
        },
        host: {
          title: this.homePageLabel,
          type: 'text',
          width: '25%',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row.homePage,
        },
        details: {
          title: this.detailsLabel,
          filter: false,
          sort: false,
          width: '5%',
          type: 'custom',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row,
          renderComponent: InfoRenderRemoteCatalogueComponent,
        },
        actions: {
          title: this.actionsLabel,
          sort: false,
          width: '5%',
          filter: false,
          type: 'custom',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row,
          renderComponent: ActionsFederateComponent,//TODO
          onComponentInitFunction: (instance) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars
            instance.updateResult.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.ngOnInit());
          },
        },
      },
    };
  }

}


