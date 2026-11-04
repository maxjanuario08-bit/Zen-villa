import ServiceRequestFormPage from "@/components/ServiceRequestFormPage";
import {voyageursServices} from "@/lib/voyageurs-services";
export default async function RequestServicePage({searchParams}: {searchParams:Promise<{prestation?:string|string[]}>}){
 const {prestation}=await searchParams;
 const initialService=typeof prestation==="string"&&voyageursServices.some(service=>service.slug===prestation)?prestation:"";
 return <ServiceRequestFormPage initialService={initialService}/>;
}
