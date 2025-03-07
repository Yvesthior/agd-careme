"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyTracker } from "@/components/weekly-tracker";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getUserEntries, createNewWeek } from "@/lib/entries";
import { useToast } from "@/hooks/use-toast";
import type { WeeklyEntry } from "@/types/entries";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  const formattedDateRange = `${format(startDate, "d MMMM", {
    locale: fr,
  })} au ${format(endDate, "d MMMM yyyy", { locale: fr })}`;

  const loadEntries = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getUserEntries(startDate, endDate);
      setEntries(data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos données",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, startDate, endDate, toast]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }

    if (isLoaded && user) {
      loadEntries();
    }
  }, [isLoaded, user, router, loadEntries]);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [currentDate, user, loadEntries]);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleCreateNewWeek = async () => {
    try {
      await createNewWeek(startDate, endDate);
      toast({
        title: "Semaine créée",
        description: "Une nouvelle semaine a été créée",
      });
      loadEntries();
    } catch (error) {
      console.log("erreuer", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer une nouvelle semaine",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mon Carnet de Carême</h1>
          <p className="text-muted-foreground">
            Suivez votre parcours spirituel
          </p>
        </div>
        <SignOutButton>
          <Button variant="outline">Déconnexion</Button>
        </SignOutButton>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            Semaine du {formattedDateRange}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {entries.length === 0 && !isLoading && (
          <Button onClick={handleCreateNewWeek}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle semaine
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <p>Chargement des données...</p>
          </CardContent>
        </Card>
      ) : entries.length > 0 ? (
        <Tabs defaultValue="tracker" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tracker">Suivi hebdomadaire</TabsTrigger>
            <TabsTrigger value="reflections">Réflexions</TabsTrigger>
          </TabsList>
          <TabsContent value="tracker" className="space-y-4">
            <WeeklyTracker entry={entries[0]} onUpdate={loadEntries} />
          </TabsContent>
          <TabsContent value="reflections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Réflexions et commentaires</CardTitle>
                <CardDescription>
                  Vos notes et réflexions pour la semaine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Commentaires</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].comments ||
                      "Aucun commentaire pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Difficultés</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].difficulties ||
                      "Aucune difficulté notée pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Points d&apos;amélioration</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].improvements ||
                      "Aucun point d'amélioration noté pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Succès</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].successes ||
                      "Aucun succès noté pour cette semaine"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Aucune donnée pour cette semaine</p>
            <Button onClick={handleCreateNewWeek}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une nouvelle semaine
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
