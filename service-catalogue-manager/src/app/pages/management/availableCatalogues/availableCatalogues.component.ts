import { ServicesCount } from './../../../model/services/servicesCount';
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { LocalDataSource } from 'ng2-smart-table';
import { AvailableCataloguesService } from './availableCatalogues.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig, System } from '../../../model/appConfig';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActionsCatalogueMenuRenderComponent } from './actions-catalogue-menu-render/actions-catalogue-menu-render.component';
import { CatalogueEntry } from '../../../model/catalogue/catalogueEntry';
import { AddCatalogueComponent } from './add-catalogue/add-catalogue.component';
import { NbDialogService } from '@nebular/theme';
import { Component, Input, Output, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { ErrorDialogService } from '../../error-dialog/error-dialog.service';
import { Row } from 'ng2-smart-table/lib/lib/data-set/row';
import { ConnectorStatusRenderComponent } from '../../services/availableConnectors/custom-status-render.component';
import { LoginService } from '../../../auth/login/login.service';
import { StatusRenderComponent } from './status-render/status-render.component';
import { AvailableServicesService } from '../../services/availableServices/availableServices.service';
import { ErrorDialogCatalogueService } from '../../error-dialog/error-dialog-catalogue/error-dialog-catalogue.service';

@Component({
  selector: 'available-catalogues-smart-table',
  templateUrl: './availableCatalogues.component.html',
  styleUrls: ['./availableCatalogues.component.scss'],
})

export class AvailableCataloguesComponent implements OnInit, OnDestroy {
  @Input() value: CatalogueEntry;
  @Output() updateResult = new EventEmitter<unknown>();

  schemaDir: string;
  loading: Boolean = false;
  status: String = "not set";
  //refreshTry = 0;
  statusSet = false;
  public isNew = false;
  private systemConfig: System;
  private systemLocale: string;
  private config: AppConfig;
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
  private availableCatalogues: CatalogueEntry[];
  private unsubscribe: Subject<void> = new Subject();
  errorService: ErrorDialogCatalogueService;
  //refreshLimit: any;

  constructor(
    private loginService: LoginService,
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

  refresh(catalogueIn) {
    //console.debug("Refresh : ",this.refreshTry, "", this.refreshLimit)
    //if (3 * this.refreshLimit - this.refreshTry > 0)
    try {
      //this.refreshTry++;
      console.log("Refreshing")
      let apiEndpoint = catalogueIn.apiEndpoint
      if ((Date.now() > (catalogueIn.lastRefresh + catalogueIn.refresh)) && catalogueIn.active == "active") {
        console.log("Refreshed!")
        console.log(Date.now(), " > ", catalogueIn.lastRefresh, " + ", catalogueIn.refresh,
          " = ", catalogueIn.lastRefresh + catalogueIn.refresh)
        console.log("Delay ", Date.now() - (catalogueIn.lastRefresh + catalogueIn.refresh))
        let catalogueTmp: CatalogueEntry = catalogueIn
        catalogueTmp.lastRefresh = Date.now()
        this.availableServicesService.getRemoteServicesCount(apiEndpoint)
          .then(async (value) => {
            catalogueTmp.services = value.total;
            try {
              await this.availableCataloguesService.updateCatalogue(catalogueTmp, catalogueTmp.catalogueID, false);
              this.ngOnInit();
            }
            catch (error) {
              console.error(error)
              console.error("unable to refresh services")
            }
          });
      }
      //this.refreshTry = 0;
    }
    catch (error) {
      console.error("API calls error")
      console.log(error)
    }
    //else console.error("Unable to refresh service count")
    return catalogueIn.services
  }

  getStatus(row) {
    if (!this.statusSet)
      try {
        this.availableCataloguesService.getStatus(row.apiEndpoint)
          .then((value: any) => {
            this.status = value.status;
            this.statusSet = true;
            console.log("row ", row, "value", value.status)
            this.ngOnInit()
          });
      }
      catch (error) {
        console.log("errors during get status")
        console.log(error.text)
      }
    else
      console.log("row ", row, "Status set ", this.status)
    return this.status
  }

  async ngOnInit() {
    try {
      this.availableCatalogues = await this.availableCataloguesService.getCatalogues();
      //this.refreshLimit = this.availableCatalogues.length;
      void this.source.load(this.availableCatalogues);
    } catch (error) {
      console.log("errors during ng on init")
      console.log("error:<\n", error, ">\n")
      if (error.statusCode === '401' || error.status == 401) {
        void this.loginService.logout().catch((error) => this.errorService.openErrorDialog(error))
      }
      //if (error.error) if (error.error.message) console.log("message:<\n", error.error.message, ">\n")
      //else if (error.message) console.log("message:<\n", error.message, ">\n")
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  async addNew(): Promise<void> {
    try {
      this.dialogService.open(AddCatalogueComponent).onClose.subscribe(() => {
        void console.log("confirm ok", this.ngOnInit());
      });
      this.updateResult.emit(this.value);
      //this.ngOnInit()
    }
    catch (error) {
      console.log("error:<\n", error, ">\n")
      //if (error.error.message) console.log("message:<\n", error.error.message, ">\n")
      //else if (error.message) console.log("message:<\n", error.message, ">\n")

      if (error.statusCode === '401' || error.status == 401) {
        void this.loginService.logout().catch((error) => this.errorService.openErrorDialog(error))
      }
      this.errorService.openErrorDialog(error);
    }
  }

  loadTableSettings(): Record<string, unknown> {
    this.nameLabel = this.translate.instant('general.catalogues.name') as string;
    this.countryLabel = this.translate.instant('general.catalogues.country') as string;
    this.actionsLabel = this.translate.instant('general.catalogues.actions') as string;
    this.infoLabel = this.translate.instant('general.catalogues.details') as string;
    this.statusLabel = this.translate.instant('general.catalogues.status') as string;
    this.activeLabel = this.translate.instant('general.catalogues.active') as string;
    this.servicesLabel = this.translate.instant('general.catalogues.services') as string;

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
        id: {
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
        services: {
          title: this.servicesLabel,
          type: 'text',
          width: '25%',
          valuePrepareFunction: (cell, row: CatalogueEntry) => this.refresh(row),
        },
        status: {
          title: this.statusLabel,
          sort: false,
          filter: false,
          width: '5%',
          type: 'custom',
          valuePrepareFunction: async (cell, row: CatalogueEntry) => this.getStatus(row),
          renderComponent: StatusRenderComponent,
        },
        active: {
          title: this.activeLabel,
          sort: false,
          filter: false,
          width: '5%',
          type: 'custom',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row.active,
          renderComponent: StatusRenderComponent,
        },
        /*info: {
          title: this.infoLabel,
          filter: false,
          sort: false,
          width: '5%',
          type: 'custom',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row,
          //renderComponent: CatalogueInfoRenderComponent,
        },*/
        actions: {
          title: this.actionsLabel,
          sort: false,
          width: '5%',
          filter: false,
          type: 'custom',
          valuePrepareFunction: (cell, row: CatalogueEntry) => row,
          renderComponent: ActionsCatalogueMenuRenderComponent,
          onComponentInitFunction: (instance) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars
            instance.updateResult.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.ngOnInit());
          },
        },
      },
    };
  }

  resetfilters(): void {
    this.source.reset();
  }
}
