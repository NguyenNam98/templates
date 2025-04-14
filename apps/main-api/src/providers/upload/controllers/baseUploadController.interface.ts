/**
 * This interface is summaries base method for {type_upload}-upload Controller
 */
export interface UploadControllerInterface {
  // get method
  show(...args: any[]);
  // post method
  store(...args: any[]);
  // put method
  update(...args: any[]);
  // delete method
  destroy(...args: any[]);
}
