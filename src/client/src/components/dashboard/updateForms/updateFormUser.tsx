import styled from "styled-components";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { useMutation } from "@apollo/client";
import {
  GET_ALL_USERS,
  GET_ALL_USERS_BY_LAST_NAME_AND_PROFESSION_WITH_PAGINATION,
  GET_ALL_USERS_BY_LAST_NAME_AND_ROLE_WITH_PAGINATION,
  GET_ALL_USERS_BY_LAST_NAME_WITH_PAGINATION,
  TOTAL_USERS_BY_LAST_NAME,
  TOTAL_USERS_BY_LAST_NAME_AND_PROFESSION,
  TOTAL_USERS_BY_LAST_NAME_AND_ROLE,
  UPDATE_USER_ADMIN,
} from "../../../graphql/users";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useEffect, useState } from "react";

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3rem 0;
`;

interface UpdateFormUserProps {
  selectedRow: any;
  open: boolean;
  handleClose: () => void;
  page: number;
  name: string;
  onSnackbarMessageChange: any;
  onOpenSnackbarChange: any;
  onSnackbarSuccessChange: any;
}

const validationSchema = yup.object({
  firstName: yup.string().min(1).required("Required"),
  lastName: yup.string().min(1).required("Required"),
  email: yup.string().email("Invalid email!").required("Required"),
  role: yup.number().min(0).max(1).required("Required"),
  profession: yup.number().min(0).max(1).required("Required"),
  cardNumber: yup
    .number()
    .min(10000, "Card number is 5 numbers")
    .max(99999, "Card number is 5 numbers")
    .required("Required"),
});

const UpdateFormUser = ({
  selectedRow,
  open,
  handleClose,
  page,
  name,
  onSnackbarMessageChange,
  onOpenSnackbarChange,
  onSnackbarSuccessChange,
}: UpdateFormUserProps) => {
  const [updateUser] = useMutation(UPDATE_USER_ADMIN);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  useEffect(() => {
    if (typeof onSnackbarMessageChange === "function") {
      onSnackbarMessageChange(message);
    }
    if (typeof onOpenSnackbarChange === "function") {
      onOpenSnackbarChange(openSnackbar);
    }
    if (typeof onSnackbarSuccessChange === "function") {
      onSnackbarSuccessChange(snackbarSuccess);
    }
  }, [
    message,
    openSnackbar,
    snackbarSuccess,
    onSnackbarMessageChange,
    onOpenSnackbarChange,
    onSnackbarSuccessChange,
  ]);

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <>
        <DialogTitle>
          Update {selectedRow.firstName} {selectedRow.lastName}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              firstName: selectedRow.firstName,
              lastName: selectedRow.lastName,
              email: selectedRow.email,
              role: selectedRow.role,
              profession: selectedRow.profession,
              cardNumber: selectedRow.cardNumber,
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              try {
                await updateUser({
                  variables: {
                    id: selectedRow.id,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    role: Number(values.role),
                    profession: Number(values.profession),
                    cardNumber: values.cardNumber,
                  },
                  refetchQueries: [
                    {
                      query: GET_ALL_USERS,
                    },
                    {
                      query:
                        GET_ALL_USERS_BY_LAST_NAME_AND_PROFESSION_WITH_PAGINATION,
                      variables: {
                        lastName: name,
                        profession: 0,
                        limit: 10,
                        offset: page * 10,
                      },
                    },
                    {
                      query:
                        GET_ALL_USERS_BY_LAST_NAME_AND_PROFESSION_WITH_PAGINATION,
                      variables: {
                        lastName: name,
                        profession: 1,
                        limit: 10,
                        offset: page * 10,
                      },
                    },
                    {
                      query:
                        GET_ALL_USERS_BY_LAST_NAME_AND_ROLE_WITH_PAGINATION,
                      variables: {
                        lastName: name,
                        role: 1,
                        limit: 10,
                        offset: page * 10,
                      },
                    },
                    {
                      query: GET_ALL_USERS_BY_LAST_NAME_WITH_PAGINATION,
                      variables: {
                        lastName: name,
                        limit: 10,
                        offset: page * 10,
                      },
                    },
                    {
                      query: TOTAL_USERS_BY_LAST_NAME_AND_ROLE,
                      variables: {
                        lastName: name,
                        role: 1,
                      },
                    },
                    {
                      query: TOTAL_USERS_BY_LAST_NAME_AND_PROFESSION,
                      variables: {
                        lastName: name,
                        profession: 1,
                      },
                    },
                    {
                      query: TOTAL_USERS_BY_LAST_NAME_AND_PROFESSION,
                      variables: {
                        lastName: name,
                        profession: 0,
                      },
                    },
                    {
                      query: TOTAL_USERS_BY_LAST_NAME,
                      variables: {
                        lastName: name,
                      },
                    },
                  ],
                });
                setSnackbarSuccess(true);
                setMessage("User is updated!");
                setOpenSnackbar(true);
                handleClose();
              } catch (error) {
                setSnackbarSuccess(false);
                setMessage(`User is not updated due to error: ${error}`);
                setOpenSnackbar(true);
              }
              setSubmitting(false);
            }}
            validationSchema={validationSchema}
          >
            {({
              handleSubmit,
              isSubmitting,
              handleChange,
              submitForm,
              setFieldValue,
              values,
              touched,
              errors,
            }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      component={TextField}
                      fullWidth
                      name="firstName"
                      type="text"
                      label="First name:"
                      value={values.firstName}
                      onChange={(e: any) => {
                        setFieldValue("firstName", e.target.value);
                      }}
                      error={Boolean(touched.firstName && errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      component={TextField}
                      fullWidth
                      name="lastName"
                      type="text"
                      label="Last name:"
                      value={values.lastName}
                      onChange={(e: any) => {
                        setFieldValue("lastName", e.target.value);
                      }}
                      error={Boolean(touched.lastName && errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      component={TextField}
                      fullWidth
                      name="email"
                      type="text"
                      label="Email:"
                      value={values.email}
                      onChange={(e: any) => {
                        setFieldValue("email", e.target.value);
                      }}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      component={TextField}
                      fullWidth
                      name="cardNumber"
                      type="number"
                      label="Card number:"
                      value={values.cardNumber}
                      onChange={(e: any) => {
                        setFieldValue("cardNumber", e.target.value);
                      }}
                      error={Boolean(touched.cardNumber && errors.cardNumber)}
                      helperText={touched.cardNumber && errors.cardNumber}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      component={Select}
                      fullWidth
                      name="profession"
                      label="Profession:"
                      value={values.profession}
                      onChange={(e: any) => {
                        setFieldValue("profession", e.target.value);
                      }}
                      error={Boolean(touched.profession && errors.profession)}
                      helperText={touched.profession && errors.profession}
                    >
                      <MenuItem value="0">Student</MenuItem>
                      <MenuItem value="1">Staff</MenuItem>
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      component={Select}
                      fullWidth
                      name="role"
                      label="Role:"
                      value={values.role}
                      onChange={(e: any) => {
                        setFieldValue("role", e.target.value);
                      }}
                      error={Boolean(touched.role && errors.role)}
                      helperText={touched.role && errors.role}
                    >
                      <MenuItem value="0">User</MenuItem>
                      <MenuItem value="1">Admin</MenuItem>
                      <MenuItem value="2">Super admin</MenuItem>
                    </Field>
                  </Grid>
                </Grid>
                <ButtonContainer>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    onClick={submitForm}
                    style={{
                      backgroundColor: "#F58732",
                      marginRight: "3rem",
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    size="large"
                    fullWidth
                    style={{
                      borderColor: "#ED0034",
                      borderWidth: "2px",
                    }}
                  >
                    Cancel
                  </Button>
                </ButtonContainer>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </>
    </Dialog>
  );
};

export default UpdateFormUser;
