/**
 * Service Catalog API
 * Service Catalog APIs used to manage CRUD for Service Model descriptions.
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { DatasetSchema } from './datasetSchema';
import { Distribution } from './distribution';
import { DataMapping } from './dataMapping';
import { Description4 } from './description4';


export interface Dataset { 
    identifier?: string;
    description: Array<Description4>;
    datasetSchema: DatasetSchema;
    dataStructureSpecification: string;
    distribution: Array<Distribution>;
    dataMapping: Array<DataMapping>;
}
