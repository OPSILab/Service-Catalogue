/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { DMMService } from './dmm.service';
import {
  NbDialogService,
  NbWindowService,
  NbDialogRef,
  NbToastrService,
  NbComponentStatus,
  NbToastrConfig,
  NbGlobalPhysicalPosition,
  NbWindowRef,
} from '@nebular/theme';
import { Validators, FormControl, FormGroup, ValidationErrors, FormArray, AbstractControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Account, AccountNotificationEnum } from '../../model/account/account.model';
import { NgxConfigureService } from 'ngx-configure';
import { AppConfig } from '../../model/appConfig';
import * as _ from "lodash"

import * as JSONEditor from '../../../../node_modules/jsoneditor/dist/jsoneditor.js';

import { DOCUMENT } from '@angular/common';
import { DialogImportComponent } from './dialog-import/dialog-import.component';
import { DialogDataMapComponent } from './dialog-dataMap/dialog-dataMap.component';

@Component({
  selector: 'app-root',
  templateUrl: './dmm.component.html',
  styleUrls: ['./dmm.component.scss'],
})
export class DMMComponent implements OnInit {
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;

  editor: any;
  //editor2:any;
  container: any;
  container2: any;
  container3: any;
  selectBox: any;
  inputType: any;
  public isNew = false;
  separatorItem = ';';
  csvSourceData: string;
  sourceRef: string = '';
  typeSource: string;

  flipped = false;
  csvtable: any;
  sourceRefFormat: string;
  mapOptions: string[];
  paths: string[];
  editor2: any;

  toggleView() {
    this.flipped = !this.flipped;
  }

  constructor(@Inject(DOCUMENT) private document: Document, protected dialogService: NbDialogService, private windowService: NbWindowService) {}



  ngOnInit(): void {
    this.container = this.document.getElementById('jsoneditor');
    this.container2 = this.document.getElementById('jsoneditor2');
    this.container3 = this.document.getElementById('jsoneditor3');
    this.selectBox = <HTMLInputElement>this.document.getElementById('input-type');
    this.csvtable = this.document.getElementById('csv-table');







    //var selectedValue = 'csv';

    const options = {
      mode: 'view',
      modes: ['view', 'code'], // allowed modes
      onModeChange: function (newMode, oldMode) {},
    };

    const json = {};

    this.editor = new JSONEditor(this.container, options, json);

    const options3 = {
      mode: 'view',
      modes: ['view', 'preview'], // allowed modes
      onModeChange: function (newMode, oldMode) {},
    };

    const json3 = [
      {

      }
    ];

    const editor3 = new JSONEditor(this.container3, options3, json3);

  }

  getAllNestedProperties(obj) {
    let properties = [];

    for (let key in obj) {
      properties.push(key);
      if (typeof obj[key] === 'object') {
        let nestedProps = this.getAllNestedProperties(obj[key]);
        properties = properties.concat(nestedProps.map((prop) =>prop));
      }
    }
    return properties;


  }

   //skipArrays:Ignore the array part
   //keepObjKeys:Whether to keep the parent object keys

   getKeys(obj, keepObjKeys, skipArrays, keys=[], scope=[]) {

    if (Array.isArray(obj)) {
      /*if (!skipArrays) scope.push('[' + obj.length + ']');
      obj.forEach((o) => this.getKeys(o, keepObjKeys, skipArrays, keys, scope), keys);*/
    } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
      Object.keys(obj).forEach((k) => {
        if ((!Array.isArray(obj[k]) && !(typeof obj[k]==='object')) || keepObjKeys) {
          let path = scope.concat(k).join('.').replace(/\.\[/g, '[');
          if (!keys.includes(path)) keys.push(path);
        }
        this.getKeys(obj[k], keepObjKeys, skipArrays, keys, scope.concat(k));
      }, keys);
    }
    return keys;
  }

  onUpdateInputType(event) {
    const divJsonElement = document.getElementById('json-input');
    const divCSVElement = document.getElementById('csv-input');

    if (event === 'csv') {
      divCSVElement.style.display = 'block';
      divJsonElement.style.display = 'none';
    } else {
      divCSVElement.style.display = 'none';
      divJsonElement.style.display = 'block';
    }
  }

  onUpdatePathForDataMap(event) {
    this.mapOptions= this.selectMapJsonOptions(this.editor.getText(), event);
    this.setMapEditor();
  }
  setMapEditor() {

    var dialogService= this.dialogService;
    var mOptions=this.mapOptions

    const options2 = {
      mode: 'tree',
      modes: ['tree', 'code', 'view', 'preview'], // allowed modes
      onModeChange: function (newMode, oldMode) {


      },


      onCreateMenu: function (items, node) {
        const path = node.path

        // log the current items and node for inspection

        var selectPath = path;
        function pathToMap() {

         dialogService
      .open(DialogDataMapComponent, {
        context: { mapOptions: mOptions, selectPath:selectPath  },
      })


        }

        if (path) {
          items.push({
            text: 'Map', // the text for the menu item
            title: 'Put the map with source', // the HTML title attribute
            className: 'example-class',
            click: pathToMap // the function to call when the menu item is clicked
          })
        }

        items.forEach(function (item, index, items) {
          if ("submenu" in item) {
            // if the item has a submenu property, it is a submenu heading
            // and contains another array of menu items. Let's colour
            // that yellow...
            items[index].className += ' submenu-highlight'
          } else {
            // if it's not a submenu heading, let's make it colorful
            items[index].className += ' rainbow'
          }
        })

        // note that the above loop isn't recursive, so it only alters the classes
        // on the top-level menu items. To also process menu items in submenus
        // you should iterate through any "submenu" arrays of items if the item has one.

        // next, just for fun, let's remove any menu separators (again just at the
        // top level menu). A menu separator is an item with a type : 'separator'
        // property
        items = items.filter(function (item) {
          return item.type !== 'separator'
        })

        // finally we need to return the items array. If we don't, the menu
        // will be empty.
        return items
      }

    };

    const json2 = {
      "name": "",
      "location": "",
      "totalSlotNumber": "",
      "address": {
          "streetAddress": ""
       },
      "targetDataModel": "BikeHireDockingStation"
    }

  const editor2 = new JSONEditor(this.container2, options2, json2);

  this.editor2=editor2;

  }

  saveAsFile(): void {

    this.windowService.open(
      this.contentTemplate,
      { title: 'Window content from template', context: { text: 'some text to pass into template' } },
    );
  }

  importSource(typeSource: string): void {
    this.typeSource = typeSource;
    this.dialogService
      .open(DialogImportComponent, {
        context: { type: typeSource },
      })
      .onClose.subscribe((result: { content: string; source: string; format:string }) => {
        if (result?.content) {
          this.sourceRef = result?.source;
          this.sourceRefFormat=result?.format;
          if (typeSource == 'csv') {
            this.csvSourceData = result.content;
            this.displayCSV(this.csvSourceData, this.csvtable, this.separatorItem);
            this.mapOptions= this.csvSourceData.slice(0, this.csvSourceData.indexOf("\n")).split(this.separatorItem);

          } else {
            this.editor.setText(result.content);

            //this.mapOptions = this.getAllNestedProperties(JSON.parse(result.content));
            this.paths=this.selectMapJsonOptions(result.content, '')
          }
        }
      });
  }



  selectMapJsonOptions(content: string, path:string): string[] {

    return this.getKeys(_.get(JSON.parse(content), path+'[0]', JSON.parse(content) ), true, true)


  }



  displayCSV(csvData: string, element: HTMLElement, separator: string) {
    // Split the CSV data into an array of rows
    var divElement = document.createElement('div');
    divElement.style.overflowY="auto";
    divElement.style.height="200px";

    const rows = csvData.split('\n');

    // Create a table element
    var table = document.createElement('table');
    table.className = 'table table-striped';

    // Loop through each row in the CSV data
    rows.forEach((rowData, index) => {
      // Split the row into an array of cells
      const cells = rowData.split(separator);

      // Create a table row element

      const row = document.createElement(index === 0 ? 'thead' : 'tr');

      // Loop through each cell in the row and add it to the table cell element
      cells.forEach((cellData) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        cell.textContent = cellData;
        row.appendChild(cell);
      });

      // Add the row to the table
      table.appendChild(row);
    });

    // Add the table to the document
    divElement.appendChild(table);
    element.appendChild(divElement);
  }


}


