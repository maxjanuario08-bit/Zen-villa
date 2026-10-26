import path from "path";
/** Isolated directory for local end-to-end checks; never used in production. */
export function localCrmPath(name:string,folder="data"){
 const isolated=process.env.NODE_ENV!=="production"?process.env.ZENVILLA_CRM_TEST_DIR:"";
 if(isolated)return path.join(isolated,name);
 return folder===".data" ? path.join(process.cwd(),".data",name) : path.join(process.cwd(),"data",name);
}
