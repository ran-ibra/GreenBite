import { useState } from 'react';
import { Label, TextInput, Button, Checkbox } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFromData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState();
  const [fieldErros, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let errors = {
      email: "",
      password: "",
    };
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!passwordRegex.test(formData.password)) {
      errors.password = "Password cannot be empty or contain spaces";
    }
    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    try {
      await login(formData);
      console.log("login succse");
      navigate("/home");
    } catch (error) {
      console.log(`login failed ${error}`);
      setFormError("Invalid email or password ");
    }
  };

    return (
        <div className="w-full max-w-xl lg:max-w-3xl">

            {/* Form Header */}
            <div className="mb-6 lg:mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    Login
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                    Login to access your GreenBite account.
                </p>
            </div>

            {/* Form */}
            <div className="space-y-2 lg:space-y-4">

                {/* Email and Password */}
                <div className="grid grid-cols-2 gap-3 lg:gap-5">
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="email"
                                color="black"
                                className="text-sm lg:text-base"
                            >
                                Email
                            </Label>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="john.doe@gmail.com"
                            required
                            sizing="md"
                            color="white"
                            className="w-full text-sm lg:text-base lg:h-12"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="password"
                                color="black"
                                className="text-sm lg:text-base"
                            >
                                Password
                            </Label>
                        </div>

                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••••••••••••"
                                required
                                sizing="md"
                                color="white"
                                className="w-full text-sm lg:text-base lg:h-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" />
                                ) : (
                                    <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2 pt-1 lg:pt-2">
                    <a href="#" className="text-red-500 hover:underline">
                        Forgot password
                    </a>
                </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer select-none "
          color="green"
          outline
          disabled={loading || !formData.email || !formData.password}
        >
          Login
        </Button>
        {/* Signup Link */}
        <p className="text-center text-sm lg:text-base text-gray-700 pt-1">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-500 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
