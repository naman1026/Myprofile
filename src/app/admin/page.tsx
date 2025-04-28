'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, LogIn, Save, Loader2, Eye, EyeOff, AlertCircle, Edit } from 'lucide-react';
import { getPortfolioData, updatePortfolioData } from '@/actions/portfolio-actions';
import type { PortfolioData } from '@/lib/portfolio-schema';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [editData, setEditData] = useState<string>(''); // Store data as JSON string for editing
  const [loading, setLoading] = useState(false);
  const [saving, startTransition] = useTransition();
  const { toast } = useToast();

  // --- Login Logic ---
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoading(true);

    // Basic client-side check (real check happens in server action)
    if (!password) {
        setLoginError('Password is required.');
        setLoading(false);
        return;
    }

    // We'll verify the password when attempting to save data in the server action.
    // For now, just assume login is successful to show the editor.
    // A more robust approach might involve a separate login server action.
    setIsLoggedIn(true);
    setLoading(false);

    // Fetch data after successful "login"
    fetchData();
  };

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPortfolioData();
      setPortfolioData(data);
      // Format data nicely for the textarea
      setEditData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      toast({
        title: "Error",
        description: "Could not load portfolio data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Data Saving ---
  const handleSave = async () => {
    if (!editData) {
        toast({ title: "Error", description: "No data to save.", variant: "destructive" });
        return;
    }
    if (!password) {
         toast({ title: "Error", description: "Admin password is required to save changes.", variant: "destructive" });
        return;
    }

    let parsedData;
    try {
        parsedData = JSON.parse(editData);
        // Optional: Add basic validation here before sending if needed
    } catch (e) {
        toast({ title: "Error", description: "Invalid JSON format. Please check your data.", variant: "destructive" });
        return;
    }


    startTransition(async () => {
        setLoginError(null); // Clear previous login errors
        const formData = new FormData();
        formData.append('adminPassword', password);
        formData.append('portfolioData', editData); // Send JSON string

        const result = await updatePortfolioData(formData);

        if (result.success) {
            setPortfolioData(result.data || null); // Update local state with saved data
             setEditData(JSON.stringify(result.data, null, 2)); // Update textarea
            toast({
            title: "Success",
            description: "Portfolio data updated successfully.",
            });
        } else {
            // Specific check for password error
            if (result.error?.includes('Invalid admin password')) {
                setLoginError(result.error);
                setIsLoggedIn(false); // Log out on password failure
            }
            toast({
                title: "Error Saving Data",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
    });
  };

   // Effect to fetch data when isLoggedIn changes to true
  //  useEffect(() => {
  //   if (isLoggedIn) {
  //     fetchData();
  //   }
  // }, [isLoggedIn]);


 // --- Render Logic ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background text-foreground">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-accent flex items-center">
              <LogIn className="mr-2" /> Admin Login
            </CardTitle>
             <CardDescription>Enter the admin password to manage content.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                 <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10 bg-secondary/50 focus:bg-background" // Added padding for icon
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                 </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
               <Link href="/" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // --- Logged In View ---
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-card to-background text-foreground">
       <div className="flex justify-between items-center mb-6">
            <Link href="/" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => { setIsLoggedIn(false); setPassword(''); setLoginError(null); }}>
                Logout
            </Button>
       </div>

      <Card className="max-w-4xl mx-auto bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-accent flex items-center"><Edit className="mr-2"/> Edit Portfolio Content</CardTitle>
          <CardDescription>
            Modify the portfolio data below. Ensure the structure remains valid JSON.
            <br/>
             <strong className="text-destructive">Warning:</strong> Incorrect JSON structure or data types can break the portfolio display.
          </CardDescription>
           {/* Display password input again for saving */}
           <div className="pt-4 space-y-2">
                <Label htmlFor="adminPasswordSave">Admin Password (required to save)</Label>
                <div className="relative">
                    <Input
                        id="adminPasswordSave"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter password to save changes"
                        className="pr-10 bg-secondary/50 focus:bg-background max-w-xs"
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-[calc(100%-2.5rem)] sm:left-[calc(theme(maxWidth.xs)-2.5rem)] top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                 {loginError && ( // Show login error near the save button if it occurs during save
                    <p className="text-sm text-destructive mt-1">{loginError}</p>
                )}
            </div>
        </CardHeader>
        <CardContent>
          {loading && !portfolioData ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              rows={25}
              className="w-full p-4 border rounded-md font-mono text-sm bg-secondary/30 focus:bg-background"
              placeholder="Loading portfolio data..."
              disabled={loading || saving}
            />
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading || saving || !password} className="bg-accent hover:bg-accent/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>


    </div>
  );
}
