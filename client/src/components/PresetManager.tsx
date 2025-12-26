import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Save, FolderOpen, Trash2, Plus } from 'lucide-react';
import { usePresets, Preset } from '@/hooks/use-presets';
import { useToast } from '@/hooks/use-toast';

interface PresetManagerProps {
  toolId: string;
  currentValues: Record<string, any>;
  onLoadPreset: (values: Record<string, any>) => void;
}

export function PresetManager({ toolId, currentValues, onLoadPreset }: PresetManagerProps) {
  const { presets, savePreset, deletePreset } = usePresets(toolId);
  const [newPresetName, setNewPresetName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    savePreset(newPresetName, currentValues);
    setNewPresetName('');
    setIsDialogOpen(false);
    toast({
      title: "Preset saved",
      description: `"${newPresetName}" has been saved to your local storage.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9" data-testid="button-load-preset">
            <FolderOpen className="h-4 w-4" />
            Presets ({presets.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Saved Configurations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presets.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No presets saved yet
            </div>
          ) : (
            presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                className="flex items-center justify-between group"
                onClick={() => onLoadPreset(preset.values)}
              >
                <span className="truncate">{preset.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9" data-testid="button-save-preset">
            <Save className="h-4 w-4" />
            Save Current
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Standard Mortgage 30y"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!newPresetName.trim()}>Save Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
