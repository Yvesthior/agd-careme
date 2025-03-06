"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateWeeklyEntry } from "@/lib/entries";
import type { WeeklyEntry } from "@/types/entries";

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const exercises = [
  { id: "morningPrayer", label: "Prière Matinale", availableAll: true },
  { id: "mass", label: "Messe", availableAll: true },
  { id: "rosary", label: "Chapelet", availableAll: true },
  { id: "lectio", label: "Lectio", availableAll: true },
  { id: "fasting", label: "Jeûne", availableAll: true },
  { id: "eveningPrayer", label: "Prière du Soir", availableAll: true },
  { id: "tuesdayPrayer", label: "Prière Mardi", availableDay: 1 },
  { id: "fridayPrayer", label: "Prière Vendredi", availableDay: 4 },
  { id: "wakeupSpace", label: "Espace du Réveil", availableDay: 6 },
];

interface WeeklyTrackerProps {
  entry: WeeklyEntry;
  onUpdate: () => void;
}

export function WeeklyTracker({ entry, onUpdate }: WeeklyTrackerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [localEntry, setLocalEntry] = useState<WeeklyEntry>(entry);
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const handleCheckboxChange = (
    day: number,
    exercise: string,
    checked: boolean
  ) => {
    const updatedDays = [...localEntry.days];

    if (!updatedDays[day]) {
      updatedDays[day] = { date: new Date(), exercises: {} };
    }

    updatedDays[day].exercises = {
      ...updatedDays[day].exercises,
      [exercise]: checked,
    };

    setLocalEntry({
      ...localEntry,
      days: updatedDays,
    });
  };

  const handleTextChange = (field: keyof WeeklyEntry, value: string) => {
    setLocalEntry({
      ...localEntry,
      [field]: value,
    });
  };

  const handleSave = async () => {
    console.log("localEntry", localEntry);
    setIsLoading(true);
    try {
      await updateWeeklyEntry(localEntry);
      toast({
        title: "Sauvegardé",
        description: "Vos données ont été sauvegardées avec succès",
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isExerciseAvailable = (exerciseId: string, dayIndex: number) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return false;

    if (exercise.availableAll) return true;
    return exercise.availableDay === dayIndex;
  };

  const DailyView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {daysOfWeek.map((day, index) => (
            <Button
              key={index}
              variant={selectedDay === index ? "default" : "outline"}
              onClick={() => setSelectedDay(index)}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
      <table className="w-full">
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="border-b last:border-b-0">
              <td className="p-4 font-medium">{exercise.label}</td>
              <td className="text-center p-4">
                <Checkbox
                  checked={
                    localEntry.days[selectedDay]?.exercises?.[exercise.id] ||
                    false
                  }
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      selectedDay,
                      exercise.id,
                      checked as boolean
                    )
                  }
                  disabled={!isExerciseAvailable(exercise.id, selectedDay)}
                  className={
                    !isExerciseAvailable(exercise.id, selectedDay)
                      ? "opacity-50"
                      : ""
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const WeeklyView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 border-b"></th>
            {daysOfWeek.map((day, index) => (
              <th key={index} className="text-center p-2 border-b">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="border-b last:border-b-0">
              <td className="p-2 font-medium">
                {exercise.label}
                {!exercise.availableAll && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({daysOfWeek[exercise.availableDay || 0]} uniquement)
                  </span>
                )}
              </td>
              {daysOfWeek.map((_, dayIndex) => (
                <td key={dayIndex} className="text-center p-2">
                  <Checkbox
                    checked={
                      localEntry.days[dayIndex]?.exercises?.[exercise.id] ||
                      false
                    }
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        dayIndex,
                        exercise.id,
                        checked as boolean
                      )
                    }
                    disabled={!isExerciseAvailable(exercise.id, dayIndex)}
                    className={
                      !isExerciseAvailable(exercise.id, dayIndex)
                        ? "opacity-50"
                        : ""
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Exercices Spirituels</CardTitle>
              <CardDescription>
                Cochez les exercices spirituels que vous avez accomplis
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsWeeklyView(!isWeeklyView)}
            >
              {isWeeklyView ? "Vue par jour" : "Vue par semaine"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isWeeklyView ? <WeeklyView /> : <DailyView />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actes de Charité</CardTitle>
          <CardDescription>
            Notez vos actes de charité pour la semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Décrivez vos actes de charité..."
            className="min-h-[100px]"
            value={localEntry.charityActs || ""}
            onChange={(e) => handleTextChange("charityActs", e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réflexions</CardTitle>
          <CardDescription>
            Notez vos réflexions, difficultés et succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Commentaires</h3>
            <Textarea
              placeholder="Vos commentaires sur la semaine..."
              value={localEntry.comments || ""}
              onChange={(e) => handleTextChange("comments", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Difficultés</h3>
            <Textarea
              placeholder="Les difficultés rencontrées..."
              value={localEntry.difficulties || ""}
              onChange={(e) => handleTextChange("difficulties", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Points d'amélioration</h3>
            <Textarea
              placeholder="Vos points d'amélioration..."
              value={localEntry.improvements || ""}
              onChange={(e) => handleTextChange("improvements", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Succès</h3>
            <Textarea
              placeholder="Vos succès de la semaine..."
              value={localEntry.successes || ""}
              onChange={(e) => handleTextChange("successes", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
            {isLoading ? "Sauvegarde en cours..." : "Sauvegarder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
