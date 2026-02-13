import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { aiRecordApi } from "@/lib/api";
import type { AiRecordDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/ai-records/$aiRecordId")({
  component: AiRecordDetailPage,
});

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  );
}

function AiRecordDetailPage() {
  const { aiRecordId } = Route.useParams();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["ai-record-detail", aiRecordId],
    queryFn: async () => {
      const res = await aiRecordApi.getDetail(Number(aiRecordId));
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">AI Record not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/ai-records" className="text-muted-foreground hover:underline text-sm">
            AI Records
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.code}</h1>
          {detail.status && (
            <Badge variant="secondary">{detail.status}</Badge>
          )}
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <InfoItem label="Code">{detail.code}</InfoItem>
            <InfoItem label="AI Date">
              {detail.aiDate ? format(new Date(detail.aiDate), "dd/MM/yyyy") : "-"}
            </InfoItem>
            <InfoItem label="AI Time">{detail.aiTime || "-"}</InfoItem>
            <InfoItem label="Dam">
              {detail.damTag && detail.damId ? (
                <Link
                  to={`/cows/${detail.damId}`}
                  className="text-primary hover:underline"
                >
                  {detail.damTag}
                </Link>
              ) : (
                "-"
              )}
            </InfoItem>
            <InfoItem label="Semen">
              {detail.semenName && detail.semenId ? (
                <Link
                  to={`/semen/${detail.semenId}`}
                  className="text-primary hover:underline"
                >
                  {detail.semenName}
                </Link>
              ) : (
                "-"
              )}
            </InfoItem>
            <InfoItem label="Feedlot">{detail.feedlot || "-"}</InfoItem>
            <InfoItem label="AI By">{detail.aiBy || "-"}</InfoItem>
            <InfoItem label="Prepared By">{detail.preparedBy || "-"}</InfoItem>
            <InfoItem label="Status">
              {detail.status ? <Badge variant="secondary">{detail.status}</Badge> : "-"}
            </InfoItem>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pregnancy Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.pregnancyDiagnosis ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoItem label="AI Date">
                {detail.pregnancyDiagnosis.aiDate
                  ? format(new Date(detail.pregnancyDiagnosis.aiDate), "dd/MM/yyyy")
                  : "-"}
              </InfoItem>
              <InfoItem label="Diagnosis By">
                {detail.pregnancyDiagnosis.diagnosisBy || "-"}
              </InfoItem>
              <InfoItem label="PD Status">
                {detail.pregnancyDiagnosis.pdStatus ? (
                  <Badge variant="secondary">{detail.pregnancyDiagnosis.pdStatus}</Badge>
                ) : (
                  "-"
                )}
              </InfoItem>
            </div>
          ) : (
            <p className="text-muted-foreground">No pregnancy diagnosis recorded.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calf Record</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.calfRecord ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoItem label="Calf">
                {detail.calfRecord.cowTag && detail.calfRecord.cowId ? (
                  <Link
                    to={`/cows/${detail.calfRecord.cowId}`}
                    className="text-primary hover:underline"
                  >
                    {detail.calfRecord.cowTag}
                  </Link>
                ) : (
                  "-"
                )}
              </InfoItem>
            </div>
          ) : (
            <p className="text-muted-foreground">No calf record.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
