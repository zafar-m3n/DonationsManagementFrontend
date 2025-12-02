import React, { useState } from "react";
import AuthLayout from "@/layouts/AuthLayout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";

import TextInput from "@/components/form/TextInput";
import AccentButton from "@/components/ui/AccentButton";
import Heading from "@/components/ui/Heading";

// Validation schema
const schema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

const RegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const res = await API.private.registerUser(payload);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Registration successful!");
        reset();
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      const status = error.response?.status;
      let msg = "Something went wrong during registration.";

      if (status === 400) {
        msg = error.response?.data?.error || "Email already in use.";
      } else if (status === 500) {
        msg = "Server error. Please try again later.";
      }

      Notification.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6 w-full max-w-md mx-auto border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <Heading className="text-center">
          Add a New User for <span className="text-accent">SLMCS Donation Management</span>
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <TextInput placeholder="Enter Your Full Name" {...register("name")} error={errors.name?.message} />

          <TextInput type="email" placeholder="Enter Your Email" {...register("email")} error={errors.email?.message} />

          <TextInput
            type="password"
            placeholder="Password"
            {...register("password")}
            error={errors.password?.message}
          />

          <AccentButton type="submit" loading={isSubmitting} text="Add New User" spinner={<Spinner color="white" />} />
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
