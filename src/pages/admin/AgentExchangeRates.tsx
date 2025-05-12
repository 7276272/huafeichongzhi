import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/AdminLayout";
import ExchangeRateSettings from "@/components/admin/agent-settings/ExchangeRateSettings";

export default function AgentExchangeRatesPage() {
  return (
    <>
      <Helmet>
        <title>u4ee3u7406u6c47u7387u8bbeu7f6e - u7ba1u7406u540eu53f0</title>
      </Helmet>

      <AdminLayout>
        <ExchangeRateSettings />
      </AdminLayout>
    </>
  );
}
