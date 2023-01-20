import { StatusCardComponent } from './../../../dashboard/status-card/status-card.component';
import { Description } from './../../../../model/services/description';
import { FormControl } from '@angular/forms';
import { NbComponentStatus, NbDialogRef, NbGlobalPhysicalPosition, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { AvailableAdaptersService } from '../available-adapters.service'
import { NgxConfigureService } from 'ngx-configure';
import { HttpClient } from '@angular/common/http';
import { AdapterEntry } from '../../../../model/adapter/adapterEntry'
import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogAdapterService } from '../../../error-dialog/error-dialog-adapter.service';
//TODO import { ErrorDialogAdapterService } from '../../../error-dialog/error-dialog-adapter.service';


@Component({
  selector: 'add-adapter',
  templateUrl: './add-adapter.component.html',
  styleUrls: ['./add-adapter.component.scss']
})

export class AddAdapterComponent implements OnInit {
  @Input() value: AdapterEntry;
  @Output() editedValue = new EventEmitter<unknown>();
  http: HttpClient;
  configService: NgxConfigureService;
  inputItemNgModel;
  adapterId: string
  name: string
  description: string
  status: string = "inactive"
  type: string//TODO enum
  url: string
  textareaItemNgModel;
  inputItemFormControl;
  textareaItemFormControl;
  selectedFile: File;
  json: Record<string, unknown>;
  selectedItem = 'Json';
  static formType: string = 'edit';


  constructor(protected ref: NbDialogRef<AddAdapterComponent>, private toastrService: NbToastrService,
    private errorService: ErrorDialogAdapterService,
    private availableAdapterService: AvailableAdaptersService, private translate: TranslateService) {
  }

  cancel(): void {
    this.ref.close();
  }

  ngOnInit(): void {
    try {
      this.inputItemFormControl = new FormControl();
      this.textareaItemFormControl = new FormControl();
      if (this.value && this.value.adapterId) this.adapterId = this.value.adapterId
    }
    catch (error) {
      console.log("error:<\n", error, ">\n")
      if (error.error.message) console.log("message:<\n", error.error.message, ">\n")
      else if (error.message) console.log("message:<\n", error.message, ">\n")
    }

  }

  getFormType(): string {
    return AddAdapterComponent.formType
  }

  onFileChanged(event: Event): void {
    try {
      this.selectedFile = (<HTMLInputElement>event.target).files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(this.selectedFile, 'UTF-8');
      fileReader.onload = () => {
        try {
          this.json = JSON.parse(fileReader.result as string) as Record<string, unknown>;
        } catch (error) {
          this.errorService.openErrorDialog(error);
          console.log("error:<\n", error, ">\n")
          if (error.error.message) console.log("message:<\n", error.error.message, ">\n")
          else if (error.message) console.log("message:<\n", error.message, ">\n")
          this.ref.close();
        }
      };

      fileReader.onerror = (error) => {
        this.errorService.openErrorDialog(error);
      };
    } catch (error) {
      console.log("error:<\n", error, ">\n")
      if (error.error.message) console.log("message:<\n", error.error.message, ">\n")
      else if (error.message) console.log("message:<\n", error.message, ">\n")
      this.errorService.openErrorDialog(error);
    }
  }

  confirm() {
    if (AddAdapterComponent.formType == 'edit')
      this.onEdit()
    else
      this.onSubmit()
  }

  async onEdit() {
    try {
      let name = this.name, description = this.description, status = this.status, adapterId = this.adapterId, type = this.type, url = this.url;
      await this.availableAdapterService.updateAdapter((({ name, description, status, adapterId, type, url } as unknown)) as AdapterEntry, adapterId);//as unknown)) as AdapterEntry were VisualStudioCode tips
      this.ref.close({ content: this.json, format: this.selectedItem });
      this.editedValue.emit(this.value);
      this.showToast('primary', this.translate.instant('general.adapters.adapter_edited_message'), '');
    }
    catch (error) {
      let errors: Object[] = []

      if (!this.adapterId) errors.push({
        "path": "root.adapterId",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.name) errors.push({
        "path": "root.name",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.description) errors.push({
        "path": "root.description",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.url) errors.push({
        "path": "root.url",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })/*
      if (!this.type) errors.push({
        "path": "root.type",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })*/

      console.log("error:", "\n", error)
      if (error.message == "Adapter ID must be set") {
        this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
            {
              "path": "root.adapterId",
              "property": "minLength",
              "message": "Value required",
              "errorcount": 1
            }
          ]
        });
      }
      else if (error.status && error.status == 400) {
        if (error.error.status == "Adapter already exists")
          this.errorService.openErrorDialog({
            error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
              {
                "path": "root.adapterId",
                "property": "minLength",
                "message": "A adapter with adapter ID < " + this.adapterId + " > already exists",
                "errorcount": 1
              }
            ]
          });
        else this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: errors
        });
      }
    }
  }

  async onSubmit() {
    try {
      let name = this.name, description = this.description, status = this.status, adapterId = this.adapterId, type = this.type, url = this.url;
      if (adapterId == '' || adapterId == null) {
        console.log("dialog-add-new-prompt.component.ts.onSubmit(): Adapter ID must be set");
        throw new Error("Adapter ID must be set");
      }
      await this.availableAdapterService.saveAdapter((({ name, description, status, adapterId, type, url } as unknown)) as AdapterEntry);
      this.ref.close();
      this.editedValue.emit(this.value);
      this.showToast('primary', this.translate.instant('general.adapters.adapter_added_message'), '');
    }
    catch (error) {
      let errors: Object[] = []

      if (!this.adapterId) errors.push({
        "path": "root.adapterId",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.name) errors.push({
        "path": "root.name",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.description) errors.push({
        "path": "root.description",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })
      if (!this.url) errors.push({
        "path": "root.url",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })/*
      if (!this.type) errors.push({
        "path": "root.type",
        "property": "minLength",
        "message": "Value required",
        "errorcount": 1
      })*/

      console.log("error:", "\n", error)
      if (error.message == "Adapter ID must be set") {
        this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
            {
              "path": "root.adapterId",
              "property": "minLength",
              "message": "Value required",
              "errorcount": 1
            }
          ]
        });
      }
      else if (error.status && error.status == 400) {
        if (error.error.status == "Adapter already exists")
          this.errorService.openErrorDialog({
            error: 'EDITOR_VALIDATION_ERROR', validationErrors: [
              {
                "path": "root.adapterId",
                "property": "minLength",
                "message": "A adapter with adapter ID < " + this.adapterId + " > already exists",
                "errorcount": 1
              }
            ]
          });
        else this.errorService.openErrorDialog({
          error: 'EDITOR_VALIDATION_ERROR', validationErrors: errors
        });
      }
    }
  }

  private showToast(type: NbComponentStatus, title: string, body: string) {
    const config = {
      status: type,
      destroyByClick: true,
      duration: 2500,
      hasIcon: true,
      position: NbGlobalPhysicalPosition.BOTTOM_RIGHT,
      preventDuplicates: true,
    } as Partial<NbToastrConfig>;

    this.toastrService.show(body, title, config);
  }
}
