import { HttpHeaders, HttpResponse } from "@angular/common/http";


/**
 * @Author Okala III
 * Created on 09/07/2020
 *
 * @publicApi
 * Custom Http Response Model including a typed response
 * response body which maybe null
 */
export class AjaxResponse<T> {

    headers?: HttpHeaders;

    statusText?: string;

    // url: string | null;

    ok?: boolean;

    status?: number |string;

    success?: boolean;

    errorCode?: number;

    // errorMessage?: string;

    message?: string;

    timestamp?: Date;

    data?: T | T[];

}
