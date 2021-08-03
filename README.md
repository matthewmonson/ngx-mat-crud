# NgxMatCrud #

A Simple Angular Material CRUD Component

### Installation ###

#### Install via npm ####
> npm i ngx-mat-crud --save

#### Include in app.module imports ####
#### ####
````
imports: [        
        NgxMatCrudModule
        ..
    ],
````

#### Implement NgxCrudDataService on your data service as per below example

#### Define the table and form elements as per the below example

### Example Usage in Component ###
#### ####
````
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";

import { TableDefinition, 
         FormDefinition, 
         FormControlMode,          
         FormControlType,
         CrudStatus} 
    from 'ngx-mat-crud';
    
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

    course: Course;

    tableDefinition: TableDefinition;

    formDefinition: FormDefinition;

    constructor(private route: ActivatedRoute,
        private coursesService: CoursesService) {
    }

    onCrudStatus($status: CrudStatus): void {
        console.log(JSON.stringify($status));
    }

    ngOnInit() {

        this.course = this.route.snapshot.data["course"];

        // define crud table
        this.tableDefinition = {
            columns: [
                {
                    headingLabel: '#',
                    dataField: 'id'
                },
                {
                    headingLabel: "Description",
                    dataField: "description",
                    filter: true
                }
            ],
            pageSizes: [3, 5, 20],
            defaultPageSize: 3,
            defaultSortColumn: 'id',
            keyField: 'id',
            dataService: this.coursesService,
            key: this.course.id,
            canAdd: true,
            canEdit: false,
            canDelete: false
        }

        // define the crud form
        this.formDefinition = {
            title: "Lesson",
            width: '500px',
            height: '500px',
            controls: [
                {
                    controlType: FormControlType.TEXTBOX,
                    label: "duration",
                    order: 2,
                    dataField: "duration",
                    required: true,
                    editMode: FormControlMode.READONLY,
                    addMode: FormControlMode.EDITABLE
                },
                {
                    controlType: FormControlType.TEXTBOX,
                    label: "description",
                    order: 1,
                    dataField: "description",
                    required: true,
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE,
                    validatorFns: [{function: this.validateDescription.bind(this), message: 'bob is not allowed in description'}]
                },
                {
                    controlType: FormControlType.DATE,
                    label: "date",
                    order: 4,
                    dataField: "date",
                    required: true,
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE
                },
                {
                    controlType: FormControlType.CHECKBOX,
                    label: "checkbox",
                    order: 5,
                    dataField: "checkbox",
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE
                },
                {
                    controlType: FormControlType.TOGGLE,
                    label: "toggle",
                    order: 6,
                    dataField: "toggle",                    
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE,
                    defaultValues: [{label: "yes", val: "yes"}]
                },
                {
                    controlType: FormControlType.DYNAMIC_LOOKUP,
                    label: "dynamic lookup",
                    order: 7,
                    dataField: "dynamiclookup",
                    required: true,
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE,
                    lookupName: "lessontypes"
                },
                {
                    controlType: FormControlType.STATIC_LOOKUP,
                    label: "static lookup",
                    order: 8,
                    dataField: "staticlookup",
                    required: true,
                    editMode: FormControlMode.EDITABLE,
                    addMode: FormControlMode.EDITABLE,                    
                    staticOptions: [{"label": "label1", val: "value1"},{"label": "label2", val: "value2"}],
                    defaultValues:[{"label": "label2", val: "value2"}],
                }  
            ]
        }
    }
    
    // custom validator used in description form field above
    validateDescription(control: AbstractControl): { [key: string]: any } {
        if (control.value === 'bob') {
            return { validateDescription: true };
        } else {
            return null;
        }
    }    
}

````
### Example Styling of Column Headers ###
#### ####
````
::ng-deep .ngx-mat-crud-table-id-column {
    max-width: 40px;
}
::ng-deep .ngx-mat-crud-table-actions-column {
    max-width: 60px;
}
````

### Example Usage in Data Service ###
#### ####
````
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Course } from "../model/course";
import { map } from "rxjs/operators";
import { Lesson } from "../model/lesson";
import { NgxCrudDataService, DisplayValue, FilterValue, TableEvent, CrudEvent, TableData } from "ngx-mat-crud";

@Injectable()
export class CoursesService implements NgxCrudDataService {

    constructor(private http: HttpClient) {
    }
    NgxMatCrudListRecords($name: string, $event: TableEvent): Observable<TableData> {
        switch($name) {
            case "courselessons":
                return this.findLessons($event.key, $event.filterValues, $event.sortField, $event.sortDirection, $event.pageIndex, $event.pageSize)
                    .pipe(
                        map(results => {
                            let tableData: TableData = {numResults: 0, data: null};
                            tableData.data = results;
                            tableData.numResults = 100;
                            return tableData;
                        })
                    )
            default:
                throw new Error("Name [" + $name + "] not found");
        }
    }
    NgxMatCrudCreateRecord($name: any, $event: CrudEvent): Observable<any> {
        switch($name) {
            case "courselessons":
                return this.addLesson($event.eventData);
            default:
                throw new Error("Name [" + $name + "] not found");
        }
    }
    NgxMatCrudReadRecord($name: any, $event: CrudEvent): Observable<any> {
        switch($name) {
            case "courselessons":
                return this.findLessonById($event.key);
            default:
                throw new Error("Name [" + $name + "] not found");
        }
    }
    NgxMatCrudUpdateRecord($name: any, $event: CrudEvent): Observable<any> {
        switch($name) {
            case "courselessons":
                return this.http.put<Lesson>(`/api/lessons/` + $event.key, $event.eventData);
            default:
                throw new Error("Name [" + $name + "] not found");
        }
    }
    NgxMatCrudDeleteRecord($name: any, $event: CrudEvent): Observable<any> {
        switch($name) {
            case "courselessons":
                return this.http.delete<Lesson>(`/api/lessons/` + $event.key);
            default:
                throw new Error("Name [" + $name + "] not found");
        }
    }
    NgxMatCrudLookup($lookupName: string): Observable<DisplayValue[]> {
        switch ($lookupName) {
            case "lessontypes":
                return this.findLessonTypes()
                    .pipe( // Transform result to a DisplayValue[] required by ngx-mat-crud
                        map(results => {
                            let displayValues: DisplayValue[] = [];
                            for (let result of results) {
                                displayValues.push({ label: result.description, val: result.id });
                            }
                            return displayValues;
                        })
                    );;
            default:
                throw new Error("Lookup name [" + $lookupName + "] not found.");
        }
    }

    findCourseById(courseId: number): Observable<Course> {
        return this.http.get<Course>(`/api/courses/${courseId}`);
    }

    findAllCourses(): Observable<Course[]> {
        return this.http.get('/api/courses')
            .pipe(
                map(res => res['payload'])
            );
    }

    findAllCourseLessons(courseId: number): Observable<Lesson[]> {
        return this.http.get('/api/lessons', {
            params: new HttpParams()
                .set('courseId', courseId.toString())
                .set('pageNumber', "0")
                .set('pageSize', "1000")
        }).pipe(
            map(res => res["payload"])
        );
    }

    findLessons(
        courseId: number, filterValues: FilterValue[], sortField = '', sortOrder = 'asc',
        pageNumber = 0, pageSize = 3): Observable<any> {

        return this.http.get('/api/lessons', {
            params: new HttpParams()
                .set('courseId', courseId.toString())
                .set('filterValues', JSON.stringify(filterValues))
                .set('sortField', sortField)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
        }).pipe(
            map(res => res["payload"])
        );
    }

    findLessonById(lessonId: number): Observable<any> {
        return this.http.get<Lesson>(`/api/lessons/${lessonId}`);
    }

    addLesson(lesson: Lesson): Observable<any> {
        return this.http.post<Lesson>(`/api/lessons`, lesson);
    }

    updateLesson(lessonId: number, lesson: Lesson): Observable<any> {
        return this.http.put<Lesson>(`/api/lessons/${lessonId}`, lesson);
    }

    deleteLesson(lessonId): Observable<any> {
        return this.http.delete<Lesson>(`/api/lessons/${lessonId}`);
    }

    findLessonTypes(): Observable<any[]> {
        return this.http.get<any>('/api/lessontypes');
    }
}
````

### Example Usage in Template ###
#### ####
````
<div class="course">

    <h2>{{course?.description}}</h2>

    <img class="course-thumbnail" [src]="course?.iconUrl">

    <ngx-mat-crud   style="max-width: 99%;"
                    [name]="'courselessons'"
                    [tableKey]="course?.id"
                    [tableDefinition]="tableDefinition"
                    [formDefinition]="formDefinition"                    
                    (crudStatus)="onCrudStatus($event)">
    </ngx-mat-crud>
    
</div>
````
