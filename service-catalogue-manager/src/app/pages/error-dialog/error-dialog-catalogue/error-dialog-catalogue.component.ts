import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Location } from '@angular/common';
import { LoginService } from '../../../auth/login/login.service';
@Component({
  selector: 'error-dialog',
  templateUrl: 'error-dialog-catalogue.component.html',
  //changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../error-dialog.component.scss']
})
export class ErrorDialogCatalogueComponent {
  public error;

  constructor(public ref: NbDialogRef<unknown>, private _location: Location, private loginService: LoginService) {}

  closeModal(error: { [key: string]: { cause?: string } }): void {
    if (error.error?.cause === 'it.eng.opsi.cape.exception.AuditLogNotFoundException' || error.status === 0 || error.status === 401)
      void this.loginService.logout().catch((error) => console.log(error));
    // else
    //   this.backClicked();
    this.ref.close();
  }

  backClicked(): void {
    this._location.back();
  }
}
