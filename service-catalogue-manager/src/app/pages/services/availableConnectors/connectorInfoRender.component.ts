import { OnInit } from '@angular/core';
//details: i (info) button
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { ConnectorEntry } from '../../../model/connector/connectorEntry';
import { ConnectorEntryLog } from '../../../model/connector/connectorEntryLog';
import { Dataset } from '../../../model/services/dataset';
import { ServiceModel } from '../../../model/services/serviceModel';
import { ErrorDialogService } from '../../error-dialog/error-dialog.service';
import { AvailableServiceRow } from '../availableServices/availableServices.component';
import { AvailableServicesService } from '../availableServices/availableServices.service';
import { ServiceInfoRenderComponent } from '../availableServices/serviceInfoRender.component';
import { DialogAddNewPromptComponent } from './addConnector/dialog-add-new-prompt.component';
import { AvailableConnectorsService } from './availableConnectors.service';


@Component({
  templateUrl: `./connectorInfoRender.component.html`,
})

export class ConnectorInfoRenderComponent implements OnInit {
  @Input() value: ConnectorEntry;

  @ViewChild('availableConnectorInfoModal', { static: true }) connectorInfoModalRef: TemplateRef<unknown>;
  @ViewChild('availableServiceInfoModal', { static: true }) serviceInfoModalRef: TemplateRef<unknown>;

  logs: ConnectorEntryLog[];
  service: AvailableServiceRow;
  public settings: Record<string, unknown>;
  private date: Date;
  private message: String;
  dialogRef


  constructor(
    private errorDialogService: ErrorDialogService,
    private availableServicesService: AvailableServicesService,
    private translate: TranslateService,
    private modalService: NbDialogService,
    private translateService: TranslateService,
    private availableConnectorsService: AvailableConnectorsService,
    private dialogService: NbDialogService
  ) {
    this.settings = this.loadTableSettings();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.logs = await this.availableConnectorsService.getConnectorLogs(this.value.connectorId)
      if (this.value.serviceId) this.service = await this.availableServicesService.getService(this.value.serviceId)
    }
    catch (error) {
      if (error.status==404) console.log("Error during services load:\nSome service with serviceId set in connector descriptions dont't exist")
    }
  }

  showConnectorInfoModal(): void {
    this.dialogRef = this.modalService.open(this.connectorInfoModalRef, {
      context: {
        modalHeader: this.value.name,
        description: this.value.description,
        connectorId: this.value.connectorId,
        serviceId: this.value.serviceId,
        status: this.value.status,
        connectorUrl: this.value.url,
      },
      hasScroll: true,
    });
  }

  showServiceInfoModal(): void {
    this.dialogRef.close()
    if (this.service) {
      this.dialogRef = this.modalService.open(this.serviceInfoModalRef, {
        context: {
          modalHeader: this.service.title,
          description: this.service.hasInfo.description.description,
          sector: this.service.hasInfo.sector,
          event: this.service.hasInfo.isGroupedBy,
          thematicArea: this.service.hasInfo.thematicArea,
          serviceId: this.service.identifier,
          serviceUri: this.service.identifier,
          publicService: this.service.isPublicService,
          iconUrl: this.service.serviceIconUrl !== '' ? this.service.serviceIconUrl : 'favicon.png',
          provider: this.service.hasServiceInstance.serviceProvider.name,
          processings: this.service.isPersonalDataHandling,
          channel: this.service.hasInfo.hasChannel,
          language: this.service.hasInfo.language,
          location: this.service.hasInfo.spatial,
          locale: this.service.locale,
          competentAuthority: this.service.hasInfo.hasCompetentAuthority,
        },
        hasScroll: true,
      });
    }
    else this.errorDialogService.openErrorDialog({
      error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
        {
          "path": "root.serviceId",
          "property": "minLength",
          "message": "No service with id < "+this.value.serviceId+" > does exists",
          "errorcount": 1
        }
      ]
    });
  }

  mapDatasetsConcept(datasets: Array<Dataset>): Map<string, string[]> {
    return datasets.reduce(
      (map, dataset) =>
        map.set(
          dataset.identifier,
          dataset.dataMapping.map(
            (concept) =>
              concept.name + (concept.required ? '' : ` (${this.translateService.instant('general.services.data_concept_optional') as string})`)
          )
        ),
      new Map<string, string[]>()
    );
  }

  viewService() {
    this.dialogService.open(ServiceInfoRenderComponent).onClose.subscribe(() => { });
  }

  loadTableSettings(): Record<string, unknown> {
    this.date = this.translate.instant('general.logs.issued') as Date;
    this.message = this.translate.instant('general.logs.message') as String;

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
        date: {
          title: this.date,
          type: 'text',
          width: '25%',
          valuePrepareFunction: (cell, row: ConnectorEntryLog) => row.issued,
        },
        message: {
          title: this.message,
          editor: {
            type: 'textarea',
          },
          width: '65%',
          valuePrepareFunction: (cell, row: ConnectorEntryLog) => row.message,
        }
      }
    };
  }
}
