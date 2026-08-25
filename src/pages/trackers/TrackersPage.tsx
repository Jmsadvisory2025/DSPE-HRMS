import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { ChevronDown, Search, Check, Pencil, X, Plus, Save, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface ClientDetails {
  client: {
    client_id: string;
    name: string;
    email: string;
  };
  team_members: any[];
}

interface Option {
  value: string;
  label: string;
}

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-1 ring-ring"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {loading ? "Loading..." : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Search..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === opt.value && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {value === opt.value && <Check className="ml-2 h-4 w-4 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TrackersPage = () => {
  const dispatch = useAppDispatch();
  const [clientsData, setClientsData] = useState<ClientDetails[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [trackerFormats, setTrackerFormats] = useState<any[]>([]);
  const [formatsLoading, setFormatsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingColumns, setEditingColumns] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [headerColor, setHeaderColor] = useState('#1e293b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isDownloading, setIsDownloading] = useState(false);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);

  const handleDownloadTemplate = async (trackerId: string) => {
    try {
      setIsDownloading(true);
      const loginDataRaw = localStorage.getItem("RecruitOS_Login_Data");
      let token = "";
      if (loginDataRaw) {
        try {
          const loginData = JSON.parse(loginDataRaw);
          token = loginData?.accessToken || "";
        } catch (e) {
          console.error(e);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/clients/tracker-formats/${trackerId}/export-template/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tracker_Template_${selectedMemberDetails?.name?.replace(/\s+/g, '_') || 'Export'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download template. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    dispatch({
      type: clientActions.FETCH_CLIENTS,
      method: "GET",
      endPoint: "/api/v1/clients/general-dropdown/",
      auth: true,
      setLoading: (val: boolean) => setLoading(val),
      getResponse: (data: any) => {
        if (data && data.clients_details) {
          setClientsData(data.clients_details);
        }
      },
      getError: (err: any) => console.error('Error fetching clients dropdown:', err),
    });
  }, [dispatch]);

  useEffect(() => {
    if (selectedClient) {
      dispatch({
        type: clientActions.FETCH_TRACKER_FORMATS,
        method: "GET",
        endPoint: `/api/v1/clients/tracker-formats/?client=${selectedClient}`,
        auth: true,
        setLoading: (val: boolean) => setFormatsLoading(val),
        getResponse: (data: any) => {
          if (data && data.results) {
            setTrackerFormats(data.results);
          }
        },
        getError: (err: any) => console.error('Error fetching tracker formats:', err),
      });
    } else {
      setTrackerFormats([]);
    }
  }, [selectedClient, dispatch]);

  const currentClientData = clientsData.find(c => c.client.client_id === selectedClient);
  const teamMembers = currentClientData?.team_members || [];

  const clientOptions: Option[] = clientsData.map(c => ({
    value: c.client.client_id,
    label: c.client.name,
  }));

  const teamMemberOptions: Option[] = teamMembers.map((member: any) => ({
    value: member.id || member.email,
    label: `${member.name} (${member.role})`,
  }));

  const selectedMemberDetails = teamMembers.find((m: any) => (m.id || m.email) === selectedTeamMember);
  const selectedFormat = trackerFormats.find(f => f.team_member_details?.id === selectedTeamMember);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingColumns(selectedFormat ? [...selectedFormat.columns] : ['']);
    setHeaderColor(selectedFormat?.header_color || '#1e293b');
    setTextColor(selectedFormat?.text_color || '#ffffff');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingColumns([]);
    setXlsxFile(null);
  };

  const handleAddColumn = () => {
    setEditingColumns([...editingColumns, '']);
  };

  const handleRemoveColumn = (index: number) => {
    setEditingColumns(editingColumns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, val: string) => {
    const newCols = [...editingColumns];
    newCols[index] = val;
    setEditingColumns(newCols);
  };

  const handleSave = () => {
    const validColumns = editingColumns.filter(c => c.trim().length > 0).map(c => c.trim());

    const isUpdate = !!selectedFormat;
    
    let payload: any;
    
    if (xlsxFile) {
      const fd = new FormData();
      if (!isUpdate) {
        fd.append('client', selectedClient);
        fd.append('team_member_id', selectedTeamMember);
      }
      if (validColumns.length > 0) {
        fd.append('columns', JSON.stringify(validColumns));
      }
      fd.append('header_color', headerColor);
      fd.append('text_color', textColor);
      fd.append('xlsx_file', xlsxFile);
      payload = fd;
    } else {
      payload = isUpdate 
        ? { columns: validColumns, header_color: headerColor, text_color: textColor } 
        : { client: selectedClient, team_member_id: selectedTeamMember, columns: validColumns, header_color: headerColor, text_color: textColor };
    }

    dispatch({
      type: isUpdate ? clientActions.UPDATE_TRACKER_FORMAT : clientActions.CREATE_TRACKER_FORMAT,
      method: isUpdate ? "PATCH" : "POST",
      endPoint: isUpdate 
        ? `/api/v1/clients/tracker-formats/${selectedFormat.id}/` 
        : `/api/v1/clients/tracker-formats/`,
      body: payload,
      auth: true,
      showSuccessMessage: true,
      setLoading: (val: boolean) => setIsSaving(val),
      getResponse: () => {
        setIsEditing(false);
        setXlsxFile(null);
        dispatch({
          type: clientActions.FETCH_TRACKER_FORMATS,
          method: "GET",
          endPoint: `/api/v1/clients/tracker-formats/?client=${selectedClient}`,
          auth: true,
          setLoading: (val: boolean) => setFormatsLoading(val),
          getResponse: (data: any) => {
            if (data && data.results) {
              setTrackerFormats(data.results);
            }
          },
        });
      },
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trackers Data</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 shrink-0">
            <label className="block text-sm font-medium mb-1">Client</label>
            <SearchableDropdown
              options={clientOptions}
              value={selectedClient}
              onChange={(val) => {
                setSelectedClient(val);
                setSelectedTeamMember('');
                setIsEditing(false);
              }}
              placeholder="Select Client"
              loading={loading}
            />
          </div>

          <div className="w-full sm:w-64 shrink-0">
            <label className="block text-sm font-medium mb-1">Tracker / Team Member</label>
            <SearchableDropdown
              options={teamMemberOptions}
              value={selectedTeamMember}
              onChange={(val) => {
                setSelectedTeamMember(val);
                setIsEditing(false);
              }}
              placeholder="Select Tracker"
              disabled={!selectedClient}
              loading={formatsLoading}
            />
          </div>
        </div>

        {selectedMemberDetails && (
          <div className=" rounded-lg border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
              {selectedMemberDetails.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium leading-none mb-1.5">{selectedMemberDetails.name}</h3>
              <p className="text-sm text-muted-foreground mb-0.5">{selectedMemberDetails.role}</p>
              <p className="text-xs text-muted-foreground">{selectedMemberDetails.email}</p>
            </div>
          </div>
        )}
      </div>

      {!selectedClient ? (
        <div className="mt-12 flex flex-col items-center justify-center p-12 bg-muted/30 border border-dashed rounded-xl animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-4 shadow-sm">
            <Search className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Client Selected</h3>
          <p className="text-muted-foreground mt-1 text-center max-w-sm">Please select a client to check details and view their tracker configuration.</p>
        </div>
      ) : !selectedTeamMember ? (
        <div className="mt-12 flex flex-col items-center justify-center p-12 bg-muted/30 border border-dashed rounded-xl animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-4 shadow-sm">
            <Search className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Tracker Selected</h3>
          <p className="text-muted-foreground mt-1 text-center max-w-sm">Please select a particular team member to view their tracker details.</p>
        </div>
      ) : selectedFormat || isEditing ? (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-xl font-bold mb-4">Tracker Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Meta Info Card */}
            <div className="col-span-1 rounded-lg border bg-card shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Format Details</h3>
              <div className="space-y-4 text-sm mt-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5">Created By</p>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                      {selectedFormat?.created_by?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium leading-none mb-1">
                        {selectedFormat?.created_by?.name || 'Pending Creation'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {selectedFormat?.created_by?.role || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Created At</p>
                  <p className="font-medium">
                    {selectedFormat?.created_at 
                      ? new Date(selectedFormat.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="font-medium">
                    {selectedFormat?.updated_at
                      ? new Date(selectedFormat.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className="pt-2 border-t mt-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Theme Colors</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border shadow-sm" style={{ backgroundColor: selectedFormat?.header_color || '#1e293b' }}></div>
                      <span className="text-xs font-medium uppercase">{selectedFormat?.header_color || '#1e293b'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border shadow-sm" style={{ backgroundColor: selectedFormat?.text_color || '#ffffff' }}></div>
                      <span className="text-xs font-medium uppercase">{selectedFormat?.text_color || '#ffffff'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columns Card */}
            <div className="col-span-1 md:col-span-2 rounded-lg border bg-card shadow-sm flex flex-col">
              <div className="border-b px-6 py-4 flex items-center justify-between bg-muted/20">
                <div>
                  <h3 className="font-semibold text-lg tracking-tight">Data Columns</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Expected fields for this tracker format</p>
                </div>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadTemplate(selectedFormat.id)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Download
                    </button>
                    <button 
                      onClick={handleEditClick}
                      className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="text-sm bg-muted text-muted-foreground px-3 py-1.5 rounded-md font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedFormat.columns?.map((col: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 bg-background border rounded-md p-3 shadow-sm hover:border-primary/40 transition-all hover:shadow-md"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate" title={col}>
                          {col}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingColumns.map((col: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <input 
                          type="text" 
                          value={col}
                          onChange={(e) => handleColumnChange(idx, e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Enter column name..."
                        />
                        <button
                          onClick={() => handleRemoveColumn(idx)}
                          className="h-9 w-9 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          title="Remove column"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddColumn}
                      className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </button>
                    
                    <div className="mt-6 pt-4 border-t flex flex-wrap gap-6">
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Upload Tracker Format File (Optional)</label>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setXlsxFile(e.target.files[0]);
                            } else {
                              setXlsxFile(null);
                            }
                          }}
                          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Header Color</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={headerColor} 
                            onChange={e => setHeaderColor(e.target.value)} 
                            className="w-10 h-10 rounded cursor-pointer p-0 border-0 bg-transparent shrink-0" 
                          />
                          <input 
                            type="text"
                            value={headerColor}
                            onChange={e => setHeaderColor(e.target.value)}
                            className="h-10 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring uppercase font-medium"
                            placeholder="#000000"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Text Color</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={textColor} 
                            onChange={e => setTextColor(e.target.value)} 
                            className="w-10 h-10 rounded cursor-pointer p-0 border-0 bg-transparent shrink-0" 
                          />
                          <input 
                            type="text"
                            value={textColor}
                            onChange={e => setTextColor(e.target.value)}
                            className="h-10 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring uppercase font-medium"
                            placeholder="#000000"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center p-12 bg-muted/30 border border-dashed rounded-xl animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-4 shadow-sm">
            <Search className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Configuration Found</h3>
          <p className="text-muted-foreground mt-1 text-center max-w-sm">There is no tracker format configured for this particular team member.</p>
          <button 
            onClick={handleEditClick}
            className="mt-6 flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Tracker Format
          </button>
        </div>
      )}
    </div>
  )
}

export default TrackersPage;