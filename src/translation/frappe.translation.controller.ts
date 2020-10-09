import RenovationController from "../renovation.controller";
import { renovationWarn } from "../utils";
import { ErrorDetail } from "../utils/error";
import {
  contentType,
  FrappeRequestOptions,
  httpMethod,
  Request,
  RequestResponse
} from "../utils/request";
import { LoadTranslationsParams } from "./interfaces";
import TranslationController from "./translation.controller";

/**
 * Class handling the translation of Frappe
 */
export default class FrappeTranslationController extends TranslationController {
  private _translationsLoaded: boolean = false;

  get translationsLoaded() {
    return this._translationsLoaded;
  }
  public handleError(errorId: string, error: ErrorDetail): ErrorDetail {
    let err: ErrorDetail;
    switch (errorId) {
      case "loadtranslation":
      default:
        err = RenovationController.genericError(error);
    }
    return err;
  }
  /**
   * Loads the translation of the selected language
   * @param loadTranslationsParams
   */
  public async loadTranslations(
    loadTranslationsParams: LoadTranslationsParams
  ): Promise<RequestResponse<{ [x: string]: string }>>;
  /**
   * Loads the translation of the selected language
   * @param lang The selected language
   * @deprecated
   */
  public async loadTranslations(
    lang?: string
  ): Promise<RequestResponse<{ [x: string]: string }>>;
  public async loadTranslations(
    loadTranslationsParams?: string | LoadTranslationsParams
  ) {
    await this.getCore().frappe.checkAppInstalled(["loadTranslations"]);
    let args: LoadTranslationsParams = {};
    if (typeof loadTranslationsParams === "string") {
      args = {
        lang: loadTranslationsParams
      };
      renovationWarn(
        "LTS-Renovation-Core",
        "loadTranslations(lang) is deprecated, please use the interfaced approach instead"
      );
    } else if (loadTranslationsParams) {
      args = loadTranslationsParams;
    }
    args.lang = args.lang || this.currentLanguage;

    const r = await Request(
      `${this.getHostUrl()}/api/method/renovation_core.utils.client.get_lang_dict`,
      httpMethod.POST,
      FrappeRequestOptions.headers,
      {
        contentType: contentType["application/x-www-form-urlencoded"],
        data: {
          lang: args.lang
        }
      }
    );
    this._translationsLoaded = true;
    if (r.success && r.data) {
      r.data = r.data.message;
      this.setMessagesDict({ dict: r.data, lang: args.lang });
      return r;
    } else {
      return RequestResponse.fail(this.handleError("loadtranslation", r.error));
    }
  }
}
