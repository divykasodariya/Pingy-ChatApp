import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import axios from "axios"; // Make sure to install axios: npm install axios
import Cookies from "js-cookie";
export function Login() {
  const [loginInput, setLoginInput] = useState({ username: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    fullname: "",
    username: "",
    password: "",
    gender: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "login") {
      setLoginInput({ ...loginInput, [name]: value });
    } else {
      setSignupInput({ ...signupInput, [name]: value });
    }
    // Clear any previous messages when input changes
    setError("");
    setSuccess("");
  };

  const handleSelectChange = (value) => {
    setSignupInput({ ...signupInput, gender: value });
    // Clear any previous messages when input changes
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (type) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (type === "login") {
        // Login API call
        const response = await axios.post(
          "https://pingy-chatapp.on.shiper.app/api/v1/user/login",
          loginInput,
          { withCredentials: true }
        );

        // Handle successful login

        if (response.status === 200 && response.data.success) {
          setSuccess("Login successful!");
          navigate("/home");
        } else {
          navigate("/home");
        }
      }

      // Optionally redirect to dashboard or home page
      // window.location.href = "/dashboard";
      else {
        // Signup API call
        const response = await axios.post(
          "https://pingy-chatapp.on.shiper.app/api/v1/user/register",
          signupInput
        );

        // Handle successful registration
        console.log("User registered successfully:", response.data);
        setSuccess("Account created successfully! You can now login.");

        // Clear the signup form
        setSignupInput({
          fullname: "",
          username: "",
          password: "",
          gender: "",
        });
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(
          error.response.data.message || "An error occurred. Please try again."
        );
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("Error setting up request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center h-screen">
      <Tabs defaultValue="Login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Login">Login</TabsTrigger>
          <TabsTrigger value="Sign up">Sign up</TabsTrigger>
        </TabsList>
        <TabsContent value="Login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your username and password to login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  required
                  name="username"
                  placeholder="john.doe123"
                  value={loginInput.username}
                  onChange={(e) => handleInputChange(e, "login")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  required
                  placeholder="password"
                  value={loginInput.password}
                  onChange={(e) => handleInputChange(e, "login")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubmit("login")} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Sign up">
          <Card>
            <CardHeader>
              <CardTitle>Sign up</CardTitle>
              <CardDescription>Create an account and join us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  name="fullname"
                  value={signupInput.fullname}
                  onChange={(e) => handleInputChange(e, "signup")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  required
                  name="username"
                  placeholder="john.doe123"
                  value={signupInput.username}
                  onChange={(e) => handleInputChange(e, "signup")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  required
                  placeholder="password"
                  value={signupInput.password}
                  onChange={(e) => handleInputChange(e, "signup")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={signupInput.gender}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubmit("signup")} disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Login;
