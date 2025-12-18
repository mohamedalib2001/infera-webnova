import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import {
  Receipt,
  Download,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  CreditCard,
  Eye,
} from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  paymentMethod?: string;
  paidAt?: string;
}

export default function Invoices() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const t = {
    ar: {
      title: "الفواتير",
      subtitle: "سجل الفواتير والمدفوعات",
      all: "الكل",
      paid: "مدفوعة",
      pending: "قيد الانتظار",
      overdue: "متأخرة",
      cancelled: "ملغاة",
      invoice: "فاتورة",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
      amount: "المبلغ",
      status: "الحالة",
      actions: "الإجراءات",
      download: "تحميل",
      view: "عرض",
      search: "بحث في الفواتير...",
      noInvoices: "لا توجد فواتير",
      noInvoicesDesc: "ستظهر فواتيرك هنا بعد إجراء عمليات الدفع",
      totalPaid: "إجمالي المدفوعات",
      totalPending: "المبالغ المعلقة",
      thisMonth: "هذا الشهر",
      lastPayment: "آخر دفعة",
      paymentMethod: "طريقة الدفع",
      paidAt: "تاريخ الدفع",
      items: "البنود",
      description: "الوصف",
      quantity: "الكمية",
      unitPrice: "سعر الوحدة",
      total: "الإجمالي",
    },
    en: {
      title: "Invoices",
      subtitle: "Invoice and payment history",
      all: "All",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
      cancelled: "Cancelled",
      invoice: "Invoice",
      date: "Date",
      dueDate: "Due Date",
      amount: "Amount",
      status: "Status",
      actions: "Actions",
      download: "Download",
      view: "View",
      search: "Search invoices...",
      noInvoices: "No invoices",
      noInvoicesDesc: "Your invoices will appear here after making payments",
      totalPaid: "Total Paid",
      totalPending: "Pending Amount",
      thisMonth: "This Month",
      lastPayment: "Last Payment",
      paymentMethod: "Payment Method",
      paidAt: "Paid At",
      items: "Items",
      description: "Description",
      quantity: "Quantity",
      unitPrice: "Unit Price",
      total: "Total",
    },
  };

  const txt = language === "ar" ? t.ar : t.en;

  const mockInvoices: Invoice[] = [
    {
      id: "INV-001",
      number: "INV-2024-001",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      amount: 99.00,
      status: "paid",
      paymentMethod: "Stripe",
      paidAt: "2024-01-16",
      items: [
        { description: language === "ar" ? "اشتراك Pro شهري" : "Pro Monthly Subscription", quantity: 1, unitPrice: 99.00, total: 99.00 },
      ],
    },
    {
      id: "INV-002",
      number: "INV-2024-002",
      date: "2024-02-15",
      dueDate: "2024-03-15",
      amount: 99.00,
      status: "paid",
      paymentMethod: "Stripe",
      paidAt: "2024-02-15",
      items: [
        { description: language === "ar" ? "اشتراك Pro شهري" : "Pro Monthly Subscription", quantity: 1, unitPrice: 99.00, total: 99.00 },
      ],
    },
    {
      id: "INV-003",
      number: "INV-2024-003",
      date: "2024-03-15",
      dueDate: "2024-04-15",
      amount: 299.00,
      status: "pending",
      items: [
        { description: language === "ar" ? "اشتراك Enterprise شهري" : "Enterprise Monthly Subscription", quantity: 1, unitPrice: 299.00, total: 299.00 },
      ],
    },
  ];

  const stats = {
    totalPaid: mockInvoices.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amount, 0),
    totalPending: mockInvoices.filter(i => i.status === "pending").reduce((acc, i) => acc + i.amount, 0),
    thisMonth: mockInvoices.filter(i => i.date.startsWith("2024-03")).reduce((acc, i) => acc + i.amount, 0),
    lastPayment: mockInvoices.find(i => i.status === "paid")?.paidAt || "-",
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const config = {
      paid: { icon: CheckCircle2, color: "default" as const, label: txt.paid },
      pending: { icon: Clock, color: "secondary" as const, label: txt.pending },
      overdue: { icon: XCircle, color: "destructive" as const, label: txt.overdue },
      cancelled: { icon: XCircle, color: "outline" as const, label: txt.cancelled },
    };
    const { icon: Icon, color, label } = config[status];
    return (
      <Badge variant={color} className="gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === "all" || invoice.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-invoices-title">
          <Receipt className="w-8 h-8 text-primary" />
          {txt.title}
        </h1>
        <p className="text-muted-foreground">{txt.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.totalPaid}</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-paid">
              ${stats.totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.totalPending}</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-pending">
              ${stats.totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.thisMonth}</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-this-month">
              ${stats.thisMonth.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.lastPayment}</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-last-payment">
              {stats.lastPayment}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>{txt.title}</CardTitle>
              <CardDescription>{txt.subtitle}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={txt.search}
                  className="pl-9 w-64"
                  data-testid="input-search-invoices"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">{txt.all}</TabsTrigger>
              <TabsTrigger value="paid" data-testid="tab-paid">{txt.paid}</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">{txt.pending}</TabsTrigger>
              <TabsTrigger value="overdue" data-testid="tab-overdue">{txt.overdue}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">{txt.noInvoices}</p>
                  <p className="text-sm">{txt.noInvoicesDesc}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <Card key={invoice.id} data-testid={`invoice-${invoice.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{invoice.number}</p>
                              <p className="text-sm text-muted-foreground">
                                {txt.date}: {invoice.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">${invoice.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{txt.dueDate}: {invoice.dueDate}</p>
                            </div>
                            {getStatusBadge(invoice.status)}
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" data-testid={`button-view-${invoice.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-download-${invoice.id}`}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {invoice.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">{txt.items}:</p>
                            <div className="space-y-1">
                              {invoice.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{item.description}</span>
                                  <span>${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {invoice.paidAt && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{txt.paymentMethod}: {invoice.paymentMethod}</span>
                            <span>{txt.paidAt}: {invoice.paidAt}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
