import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Table2, 
  Plus, 
  Trash2, 
  Key, 
  Link2, 
  Code2, 
  Settings2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import type { DevDatabaseTable, DevDatabaseColumn, DevDatabaseRelationship } from "@shared/schema";

interface SchemaBuilderProps {
  projectId: string;
  language: "ar" | "en";
}

const DATA_TYPES = [
  { value: "text", label: "Text", labelAr: "نص" },
  { value: "varchar", label: "Varchar", labelAr: "نص قصير" },
  { value: "integer", label: "Integer", labelAr: "رقم صحيح" },
  { value: "boolean", label: "Boolean", labelAr: "منطقي" },
  { value: "timestamp", label: "Timestamp", labelAr: "طابع زمني" },
  { value: "jsonb", label: "JSON", labelAr: "JSON" },
  { value: "decimal", label: "Decimal", labelAr: "عشري" },
  { value: "date", label: "Date", labelAr: "تاريخ" },
  { value: "uuid", label: "UUID", labelAr: "معرف فريد" },
];

const RELATIONSHIP_TYPES = [
  { value: "oneToOne", label: "One to One", labelAr: "واحد لواحد" },
  { value: "oneToMany", label: "One to Many", labelAr: "واحد لكثير" },
  { value: "manyToMany", label: "Many to Many", labelAr: "كثير لكثير" },
];

export function SchemaBuilder({ projectId, language }: SchemaBuilderProps) {
  const { toast } = useToast();
  const isRtl = language === "ar";
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState<string | null>(null);
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ schemaCode: string; routesCode: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [newTable, setNewTable] = useState({
    tableName: "",
    tableNameDisplay: "",
    tableNameDisplayAr: "",
    description: "",
    hasPrimaryKey: true,
    primaryKeyType: "uuid",
    hasTimestamps: true,
    generateCrudApi: true,
  });

  const [newColumn, setNewColumn] = useState({
    columnName: "",
    columnNameDisplay: "",
    dataType: "text",
    isNullable: true,
    isUnique: false,
    defaultValue: "",
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery<DevDatabaseTable[]>({
    queryKey: ["/api/dev-projects", projectId, "database", "tables"],
  });

  const { data: relationships = [] } = useQuery<DevDatabaseRelationship[]>({
    queryKey: ["/api/dev-projects", projectId, "database", "relationships"],
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: typeof newTable) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/database/tables`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "database", "tables"] });
      setShowAddTable(false);
      setNewTable({
        tableName: "",
        tableNameDisplay: "",
        tableNameDisplayAr: "",
        description: "",
        hasPrimaryKey: true,
        primaryKeyType: "uuid",
        hasTimestamps: true,
        generateCrudApi: true,
      });
      toast({
        title: isRtl ? "تم إنشاء الجدول" : "Table created",
        description: isRtl ? "تم إضافة الجدول بنجاح" : "Table has been added successfully",
      });
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return apiRequest("DELETE", `/api/dev-projects/${projectId}/database/tables/${tableId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "database", "tables"] });
      toast({
        title: isRtl ? "تم حذف الجدول" : "Table deleted",
      });
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async ({ tableId, data }: { tableId: string; data: typeof newColumn }) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/database/tables/${tableId}/columns`, data);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "database", "tables", tableId, "columns"] });
      setShowAddColumn(null);
      setNewColumn({
        columnName: "",
        columnNameDisplay: "",
        dataType: "text",
        isNullable: true,
        isUnique: false,
        defaultValue: "",
      });
      toast({
        title: isRtl ? "تم إضافة العمود" : "Column added",
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      return apiRequest("DELETE", `/api/dev-projects/${projectId}/database/columns/${columnId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "database"] });
      toast({
        title: isRtl ? "تم حذف العمود" : "Column deleted",
      });
    },
  });

  const generateApiMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/dev-projects/${projectId}/database/generate-api`);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data);
      setShowGeneratedCode(true);
    },
  });

  const toggleTableExpanded = (tableId: string) => {
    const next = new Set(expandedTables);
    if (next.has(tableId)) {
      next.delete(tableId);
    } else {
      next.add(tableId);
    }
    setExpandedTables(next);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (tablesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-2 p-3 border-b">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">
            {isRtl ? "منشئ قاعدة البيانات" : "Schema Builder"}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tables.length} {isRtl ? "جداول" : "tables"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateApiMutation.mutate()}
            disabled={tables.length === 0 || generateApiMutation.isPending}
            data-testid="button-generate-api"
          >
            {generateApiMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Code2 className="h-4 w-4" />
            )}
            <span className="mr-1">{isRtl ? "توليد API" : "Generate API"}</span>
          </Button>
          <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-table">
                <Plus className="h-4 w-4" />
                <span className="mr-1">{isRtl ? "جدول جديد" : "New Table"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isRtl ? "إنشاء جدول جديد" : "Create New Table"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRtl ? "اسم الجدول (بالإنجليزية)" : "Table Name (English)"}</Label>
                  <Input
                    value={newTable.tableName}
                    onChange={(e) => setNewTable({ ...newTable, tableName: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    placeholder={isRtl ? "users, products, orders..." : "users, products, orders..."}
                    data-testid="input-table-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? "الاسم المعروض" : "Display Name"}</Label>
                  <Input
                    value={newTable.tableNameDisplay}
                    onChange={(e) => setNewTable({ ...newTable, tableNameDisplay: e.target.value })}
                    placeholder={isRtl ? "المستخدمون، المنتجات..." : "Users, Products..."}
                    data-testid="input-table-display"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{isRtl ? "مفتاح أساسي تلقائي" : "Auto Primary Key"}</Label>
                  <Switch
                    checked={newTable.hasPrimaryKey}
                    onCheckedChange={(v) => setNewTable({ ...newTable, hasPrimaryKey: v })}
                    data-testid="switch-primary-key"
                  />
                </div>
                {newTable.hasPrimaryKey && (
                  <div className="space-y-2">
                    <Label>{isRtl ? "نوع المفتاح" : "Key Type"}</Label>
                    <Select
                      value={newTable.primaryKeyType}
                      onValueChange={(v) => setNewTable({ ...newTable, primaryKeyType: v })}
                    >
                      <SelectTrigger data-testid="select-pk-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uuid">UUID</SelectItem>
                        <SelectItem value="serial">Serial (Auto-increment)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label>{isRtl ? "طوابع زمنية" : "Timestamps"}</Label>
                  <Switch
                    checked={newTable.hasTimestamps}
                    onCheckedChange={(v) => setNewTable({ ...newTable, hasTimestamps: v })}
                    data-testid="switch-timestamps"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{isRtl ? "توليد CRUD API" : "Generate CRUD API"}</Label>
                  <Switch
                    checked={newTable.generateCrudApi}
                    onCheckedChange={(v) => setNewTable({ ...newTable, generateCrudApi: v })}
                    data-testid="switch-crud-api"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createTableMutation.mutate(newTable)}
                  disabled={!newTable.tableName || createTableMutation.isPending}
                  data-testid="button-create-table"
                >
                  {createTableMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isRtl ? "إنشاء الجدول" : "Create Table"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Database className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {isRtl ? "لا توجد جداول بعد" : "No tables yet"}
            </p>
            <p className="text-sm">
              {isRtl 
                ? "ابدأ بإنشاء جدول جديد لتصميم قاعدة البيانات" 
                : "Start by creating a new table to design your database"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                projectId={projectId}
                language={language}
                isExpanded={expandedTables.has(table.id)}
                onToggle={() => toggleTableExpanded(table.id)}
                onDelete={() => deleteTableMutation.mutate(table.id)}
                onAddColumn={() => setShowAddColumn(table.id)}
                onDeleteColumn={(columnId) => deleteColumnMutation.mutate(columnId)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={showAddColumn !== null} onOpenChange={() => setShowAddColumn(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRtl ? "إضافة عمود جديد" : "Add New Column"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRtl ? "اسم العمود" : "Column Name"}</Label>
              <Input
                value={newColumn.columnName}
                onChange={(e) => setNewColumn({ ...newColumn, columnName: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                placeholder={isRtl ? "name, email, price..." : "name, email, price..."}
                data-testid="input-column-name"
              />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? "نوع البيانات" : "Data Type"}</Label>
              <Select
                value={newColumn.dataType}
                onValueChange={(v) => setNewColumn({ ...newColumn, dataType: v })}
              >
                <SelectTrigger data-testid="select-data-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {isRtl ? type.labelAr : type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{isRtl ? "يقبل null" : "Nullable"}</Label>
              <Switch
                checked={newColumn.isNullable}
                onCheckedChange={(v) => setNewColumn({ ...newColumn, isNullable: v })}
                data-testid="switch-nullable"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{isRtl ? "فريد" : "Unique"}</Label>
              <Switch
                checked={newColumn.isUnique}
                onCheckedChange={(v) => setNewColumn({ ...newColumn, isUnique: v })}
                data-testid="switch-unique"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => showAddColumn && createColumnMutation.mutate({ tableId: showAddColumn, data: newColumn })}
              disabled={!newColumn.columnName || createColumnMutation.isPending}
              data-testid="button-create-column"
            >
              {createColumnMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isRtl ? "إضافة العمود" : "Add Column"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGeneratedCode} onOpenChange={setShowGeneratedCode}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {isRtl ? "الكود المولد" : "Generated Code"}
            </DialogTitle>
          </DialogHeader>
          {generatedCode && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold">
                    {isRtl ? "ملف Schema" : "Schema File"}
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedCode.schemaCode, "schema")}
                    data-testid="button-copy-schema"
                  >
                    {copiedField === "schema" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="mr-1">{isRtl ? "نسخ" : "Copy"}</span>
                  </Button>
                </div>
                <ScrollArea className="h-48 bg-muted rounded-md p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {generatedCode.schemaCode}
                  </pre>
                </ScrollArea>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold">
                    {isRtl ? "ملف API Routes" : "API Routes File"}
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedCode.routesCode, "routes")}
                    data-testid="button-copy-routes"
                  >
                    {copiedField === "routes" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="mr-1">{isRtl ? "نسخ" : "Copy"}</span>
                  </Button>
                </div>
                <ScrollArea className="h-48 bg-muted rounded-md p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {generatedCode.routesCode}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TableCardProps {
  table: DevDatabaseTable;
  projectId: string;
  language: "ar" | "en";
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnId: string) => void;
}

function TableCard({
  table,
  projectId,
  language,
  isExpanded,
  onToggle,
  onDelete,
  onAddColumn,
  onDeleteColumn,
}: TableCardProps) {
  const isRtl = language === "ar";

  const { data: columns = [] } = useQuery<DevDatabaseColumn[]>({
    queryKey: ["/api/dev-projects", projectId, "database", "tables", table.id, "columns"],
    enabled: isExpanded,
  });

  return (
    <Card data-testid={`card-table-${table.id}`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -mx-2"
            data-testid={`button-toggle-table-${table.id}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Table2 className="h-4 w-4 text-primary" />
            <span className="font-medium">{table.tableNameDisplay || table.tableName}</span>
            <Badge variant="outline" className="text-xs font-mono">
              {table.tableName}
            </Badge>
          </button>
          <div className="flex items-center gap-1">
            {table.hasPrimaryKey && (
              <Badge variant="secondary" className="text-xs">
                <Key className="h-3 w-3 mr-1" />
                {table.primaryKeyType}
              </Badge>
            )}
            {table.generateCrudApi && (
              <Badge variant="secondary" className="text-xs">
                API
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              data-testid={`button-delete-table-${table.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {table.hasPrimaryKey && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                <Key className="h-3 w-3" />
                <span className="font-mono">id</span>
                <Badge variant="outline" className="text-xs">
                  {table.primaryKeyType === "serial" ? "serial" : "uuid"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {isRtl ? "مفتاح أساسي" : "primary key"}
                </Badge>
              </div>
            )}
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between gap-2 text-sm px-2 py-1 bg-muted/50 rounded"
                data-testid={`row-column-${column.id}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{column.columnName}</span>
                  <Badge variant="outline" className="text-xs">
                    {column.dataType}
                  </Badge>
                  {!column.isNullable && (
                    <Badge variant="secondary" className="text-xs">
                      {isRtl ? "مطلوب" : "required"}
                    </Badge>
                  )}
                  {column.isUnique && (
                    <Badge variant="secondary" className="text-xs">
                      {isRtl ? "فريد" : "unique"}
                    </Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => onDeleteColumn(column.id)}
                  data-testid={`button-delete-column-${column.id}`}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
            {table.hasTimestamps && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  <span className="font-mono">createdAt</span>
                  <Badge variant="outline" className="text-xs">timestamp</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  <span className="font-mono">updatedAt</span>
                  <Badge variant="outline" className="text-xs">timestamp</Badge>
                </div>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={onAddColumn}
              data-testid={`button-add-column-${table.id}`}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isRtl ? "إضافة عمود" : "Add Column"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
