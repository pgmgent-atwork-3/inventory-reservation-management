import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import {
  CREATE_TAG,
  GET_ALL_TAGS_BY_NAME_WITH_PAGINATION,
  TOTAL_TAGS_BY_NAME,
} from "../../../graphql/tags";

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3rem 0;
`;

interface CreateFormTagProps {
  open: boolean;
  handleClose: () => void;
  page: number;
  name: string;
  onSnackbarMessageChange: any;
  onOpenSnackbarChange: any;
  onSnackbarSuccessChange: any;
}

const validationSchema = yup.object({
  name: yup.string().min(1).required("Required"),
});

const CreateFormTag = ({
  open,
  handleClose,
  page,
  name,
  onSnackbarMessageChange,
  onOpenSnackbarChange,
  onSnackbarSuccessChange,
}: CreateFormTagProps) => {
  const [createTag] = useMutation(CREATE_TAG);
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
    <>
      <Dialog fullWidth open={open} onClose={handleClose}>
        <>
          <DialogTitle>Create new tag</DialogTitle>
          <DialogContent>
            <Formik
              initialValues={{
                name: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                try {
                  await createTag({
                    variables: {
                      name: values.name,
                    },
                    refetchQueries: [
                      {
                        query: GET_ALL_TAGS_BY_NAME_WITH_PAGINATION,
                        variables: {
                          name: name,
                          offset: page * 10,
                          limit: 10,
                        },
                      },
                      {
                        query: TOTAL_TAGS_BY_NAME,
                        variables: {
                          name: name,
                        },
                      },
                    ],
                  });
                  setSnackbarSuccess(true);
                  setMessage("New tag is added!");
                  setOpenSnackbar(true);
                  handleClose();
                } catch (error) {
                  setSnackbarSuccess(false);
                  setMessage(`Tag is not created due to error: ${error}`);
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
                        name="name"
                        type="text"
                        label="Name:"
                        value={values.name}
                        // @ts-ignore
                        onChange={(e) => {
                          setFieldValue("name", e.target.value);
                        }}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                  </Grid>
                  <ButtonContainer>
                    <Button
                      // type='submit'
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
                      Create
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
    </>
  );
};

export default CreateFormTag;
