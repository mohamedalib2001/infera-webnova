import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Calendar, DollarSign } from "lucide-react";
import { DocLinkButton } from "@/components/doc-link-button";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
}

export default function Invoices() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const t = {
    ar: {
      title: "الفواتير",
      subtitle: "عرض وتحميل فواتيرك",
      noInvoices: "لا توجد فواتير بعد",
      noInvoicesDesc: "ستظهر فواتيرك هنا عند إجراء عمليات الشراء",
      download: "تحميل",
      amount: "المبلغ",
      date: "التاريخ",
      status: "الحالة",
      paid: "مدفوعة",
      pending: "معلقة",
      failed: "فشلت",
    },
    en: {
      title: "Invoices",
      subtitle: "View and download your invoices",
      noInvoices: "No invoices yet",
      noInvoicesDesc: "Your invoices will appear here when you make purchases",
      download: "Download",
      amount: "Amount",
      date: "Date",
      status: "Status",
      paid: "Paid",
      pending: "Pending",
      failed: "Failed",
    },
  };

  const txt = t[language];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500">{txt.paid}</Badge>;
      case "pending":
        return <Badge variant="secondary">{txt.pending}</Badge>;
      case "failed":
        return <Badge variant="destructive">{txt.failed}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(isRtl ? "ar-SA" : "en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-invoices-title">
            {txt.title}
          </h1>
          <DocLinkButton pageId="invoices" />
        </div>
        <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : invoices && invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} data-testid={`card-invoice-${invoice.id}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(invoice.status)}
                    {invoice.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          <span className={isRtl ? "mr-2" : "ml-2"}>{txt.download}</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{txt.noInvoices}</h3>
            <p className="text-muted-foreground">{txt.noInvoicesDesc}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
