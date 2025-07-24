
import { BreadcrumbSchema, EntityListSchema, OrganizationSchema, WebsiteSchema } from "@/components/schema-markup"




export default async function Home() {

  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }]} />
      <OrganizationSchema name="DroomDroom" url="https://droomdroom.com" logo="https://droomdroom.com/price/DroomDroom_light.svg" description="DroomDroom is a platform for tracking the Bitcoin holdings of public companies and governments." />
      <WebsiteSchema title="DroomDroom" description="DroomDroom is a platform for tracking the Bitcoin holdings of public companies and governments." url="https://droomdroom.com" imageUrl="https://droomdroom.com/price/DroomDroom_light.svg" />
      <div>Home Page</div>
    </>
  )
}