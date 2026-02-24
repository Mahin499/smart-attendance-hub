import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Export attendance reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-xl bg-success/10">
              <FileSpreadsheet className="h-10 w-10 text-success" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground">CSV Export</h3>
              <p className="text-sm text-muted-foreground mt-1">Download attendance data as spreadsheet</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-xl bg-destructive/10">
              <FileText className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground">PDF Report</h3>
              <p className="text-sm text-muted-foreground mt-1">Generate formatted attendance report</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
