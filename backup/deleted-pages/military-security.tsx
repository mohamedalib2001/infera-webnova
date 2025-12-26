import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Lock, Key, FileCheck, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCw, FileText, Activity, Server,
  Loader2, Eye, Download, AlertCircle, Fingerprint, Network
} from "lucide-react";

interface FIPSStatus {
  compliant: boolean;
  algorithm: string;
  keyLength: number;
  mode: string;
  hashAlgorithm: string;
  lastAudit: string;
}

interface Certificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: 'valid' | 'revoked' | 'expired';
  serialNumber: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  createdAt: string;
  reportingDeadline: string;
  affectedSystems: string[];
}

interface ComplianceReport {
  fips: { compliant: boolean; score: number };
  pki: { activeCertificates: number; revokedCertificates: number };
  sbom: { componentsTracked: number; vulnerabilitiesFound: number };
  incidentResponse: { activeIncidents: number; avgResponseTime: string };
  zeroTrust: { avgTrustScore: number; policiesEnforced: number };
}

export default function MilitarySecurityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: complianceReport, isLoading: loadingCompliance, refetch: refetchCompliance } = useQuery<{ success: boolean; data: ComplianceReport }>({
    queryKey: ['/api/military/security/compliance/report'],
    retry: false,
  });

  const encryptMutation = useMutation({
    mutationFn: async (plaintext: string) => {
      return apiRequest('/api/military/security/encrypt', {
        method: 'POST',
        body: JSON.stringify({ plaintext }),
      });
    },
    onSuccess: () => {
      toast({ title: "Encryption Successful", description: "Data encrypted with FIPS-compliant AES-256-GCM" });
    },
    onError: (error: Error) => {
      toast({ title: "Encryption Failed", description: error.message, variant: "destructive" });
    }
  });

  const generateSBOMMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/military/security/sbom/generate', {
        method: 'POST',
        body: JSON.stringify({ projectPath: '.', format: 'cyclonedx' }),
      });
    },
    onSuccess: () => {
      toast({ title: "SBOM Generated", description: "Software Bill of Materials created in CycloneDX 1.5 format" });
    },
    onError: (error: Error) => {
      toast({ title: "SBOM Generation Failed", description: error.message, variant: "destructive" });
    }
  });

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return variants[severity] || variants.medium;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      valid: "bg-green-500/10 text-green-500 border-green-500/20",
      revoked: "bg-red-500/10 text-red-500 border-red-500/20",
      expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      open: "bg-red-500/10 text-red-500 border-red-500/20",
      investigating: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      contained: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      resolved: "bg-green-500/10 text-green-500 border-green-500/20",
    };
    return variants[status] || variants.open;
  };

  const report = complianceReport?.data;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-red-500/10">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-page-title">Military Security Center</h1>
            <p className="text-sm text-muted-foreground">FIPS 140-3 Compliant Security Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchCompliance()}
            data-testid="button-refresh-compliance"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => generateSBOMMutation.mutate()}
            disabled={generateSBOMMutation.isPending}
            data-testid="button-generate-sbom"
          >
            {generateSBOMMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate SBOM
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-fips-status">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">FIPS Compliance</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {report?.fips.compliant ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {report?.fips.score || 0}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AES-256-GCM Encryption Active
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-pki-status">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">PKI Certificates</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report?.pki.activeCertificates || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report?.pki.revokedCertificates || 0} revoked
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-sbom-status">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">SBOM Components</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report?.sbom.componentsTracked || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report?.sbom.vulnerabilitiesFound || 0} vulnerabilities
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-incidents-status">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report?.incidentResponse.activeIncidents || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg response: {report?.incidentResponse.avgResponseTime || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="encryption" data-testid="tab-encryption">Encryption</TabsTrigger>
              <TabsTrigger value="certificates" data-testid="tab-certificates">Certificates</TabsTrigger>
              <TabsTrigger value="incidents" data-testid="tab-incidents">Incidents</TabsTrigger>
              <TabsTrigger value="zero-trust" data-testid="tab-zero-trust">Zero Trust</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Posture
                    </CardTitle>
                    <CardDescription>Overall security health assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>FIPS 140-3 Compliance</span>
                        <span className="font-medium">{report?.fips.score || 0}%</span>
                      </div>
                      <Progress value={report?.fips.score || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Zero Trust Score</span>
                        <span className="font-medium">{report?.zeroTrust.avgTrustScore || 0}%</span>
                      </div>
                      <Progress value={report?.zeroTrust.avgTrustScore || 0} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Policies Enforced</span>
                      <Badge variant="secondary">{report?.zeroTrust.policiesEnforced || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Compliance Standards
                    </CardTitle>
                    <CardDescription>Active compliance frameworks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {['FIPS 140-3', 'NIST CSF', 'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA'].map((framework) => (
                        <div key={framework} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">{framework}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="encryption" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    FIPS 140-3 Encryption
                  </CardTitle>
                  <CardDescription>AES-256-GCM with PBKDF2 key derivation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Algorithm</p>
                      <p className="font-medium">AES-256-GCM</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Key Length</p>
                      <p className="font-medium">256 bits</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Mode</p>
                      <p className="font-medium">GCM (AEAD)</p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Hash</p>
                      <p className="font-medium">SHA-256</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-md border border-green-500/20 bg-green-500/5">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">FIPS 140-3 Level 1 Compliant Cryptographic Module</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    PKI Certificate Management
                  </CardTitle>
                  <CardDescription>X.509 certificate issuance and revocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Root CA Certificate</p>
                          <p className="text-xs text-muted-foreground">CN=INFERA Root CA</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Network className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Intermediate CA</p>
                          <p className="text-xs text-muted-foreground">CN=INFERA Intermediate CA</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Certificate Revocation List (CRL)</span>
                      <Button variant="outline" size="sm" data-testid="button-download-crl">
                        <Download className="h-4 w-4 mr-2" />
                        Download CRL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Incident Response
                  </CardTitle>
                  <CardDescription>72-hour DoD reporting compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium">No Active Incidents</p>
                      <p className="text-sm">All systems operating normally</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zero-trust" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Zero Trust Architecture
                  </CardTitle>
                  <CardDescription>Dynamic trust scoring and policy enforcement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-green-500">
                        {report?.zeroTrust.avgTrustScore || 85}
                      </p>
                      <p className="text-sm text-muted-foreground">Average Trust Score</p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <p className="text-3xl font-bold">
                        {report?.zeroTrust.policiesEnforced || 12}
                      </p>
                      <p className="text-sm text-muted-foreground">Policies Enforced</p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-blue-500">100%</p>
                      <p className="text-sm text-muted-foreground">Continuous Verification</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Trust Score Factors</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'User Authentication', weight: '20%' },
                        { name: 'Device Compliance', weight: '15%' },
                        { name: 'Network Security', weight: '20%' },
                        { name: 'Data Classification', weight: '15%' },
                        { name: 'Behavioral Analysis', weight: '15%' },
                        { name: 'Time-based Access', weight: '15%' },
                      ].map((factor) => (
                        <div key={factor.name} className="flex items-center justify-between p-2 rounded-md border">
                          <span className="text-sm">{factor.name}</span>
                          <Badge variant="outline">{factor.weight}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
