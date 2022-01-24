import { useMutation, useQuery } from "@apollo/client";
import styled from "styled-components";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextareaAutosize,
  TextField,
} from "@material-ui/core";
import {
  Typography,
  Button,
  Input,
  Box,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, Form } from "formik";
import { GET_ALL_MODELS } from "../../../graphql/models";
import { CREATE_MEDIA } from "../../../graphql/media";
import {
  CREATE_DEVICE,
  GET_ALL_DEVICES_BY_NAME_WITH_PAGINATION,
  TOTAL_DEVICES_BY_NAME,
  UPDATE_DEVICE,
} from "../../../graphql/devices";
import { Model } from "../../../interfaces";
import QRCode from "qrcode";
import Loading from "../Loading";

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3rem 0;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.54);
  padding: 0;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.00938em;
`;

interface CreateFormDeviceProps {
  open: boolean;
  handleClose: any;
}

const generateQR = async (text: string) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error(error);
  }
};

const validationSchema = yup.object({
  modelId: yup.string().required("Required"),
});

const CreateFormDevice = ({ open, handleClose }: CreateFormDeviceProps) => {
  let deviceId: string;
  const { data, loading, error } = useQuery(GET_ALL_MODELS);
  const [createDevice] = useMutation(CREATE_DEVICE, {
    update: (proxy, mutationResult) => {
      console.log("mutationResult", mutationResult);
      deviceId = mutationResult.data.createDevice.id;
    },
  });
  const [updateDevice] = useMutation(UPDATE_DEVICE);

  if (data) {
    console.log(data);
  }

  let qrCode: string | undefined;
  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      {loading && (
        <Box
          sx={{
            padding: 3,
          }}
        >
          <Loading />
        </Box>
      )}
      {error && <p>{error.message}</p>}
      {data && (
        <>
          <DialogTitle>Create new model</DialogTitle>
          <DialogContent>
            <Formik
              initialValues={{
                modelId: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                try {
                  await createDevice({
                    variables: {
                      modelId: values.modelId,
                      deviceStatusId: "7b4a3256-6005-402b-916b-810f4d6669c8",
                    },
                    refetchQueries: [
                      {
                        query: GET_ALL_DEVICES_BY_NAME_WITH_PAGINATION,
                        variables: {
                          name: "",
                          offset: 0,
                          limit: 10,
                        },
                      },
                      {
                        query: TOTAL_DEVICES_BY_NAME,
                        variables: {
                          name: "",
                        },
                      },
                    ],
                  });

                  if (deviceId) {
                    qrCode = await generateQR(deviceId);
                  }

                  await updateDevice({
                    variables: {
                      id: deviceId,
                      qr_code: qrCode,
                    },
                  });
                  handleClose();
                } catch (error) {
                  console.log(error);
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
                      <InputLabel id="modelId">Model</InputLabel>
                      <Select
                        sx={{
                          width: "100%",
                        }}
                        labelId="modelId"
                        id="modelId"
                        value={values.modelId}
                        label="modelId"
                        onChange={(e: any) => {
                          setFieldValue("modelId", e.target.value);
                        }}
                      >
                        {data.models.map((model: Model) => {
                          return (
                            <MenuItem value={model.id}>{model.name}</MenuItem>
                          );
                        })}
                      </Select>
                    </Grid>
                  </Grid>
                  <ButtonContainer>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      onClick={submitForm}
                      sx={{
                        backgroundColor: "#F58732",
                        marginRight: "3rem",
                        ":hover": {
                          bgcolor: "#F58732",
                        },
                      }}
                    >
                      Create
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outlined"
                      size="large"
                      fullWidth
                      sx={{
                        borderColor: "#ED0034",
                        color: "#ED0034",
                        borderWidth: 2,
                        ":hover": {
                          borderColor: "#ED0034",
                          color: "#FFF",
                          borderWidth: 2,
                          bgcolor: "rgba(238, 0, 52, 0.4)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </ButtonContainer>
                </Form>
              )}
            </Formik>

            {qrCode && <img src={qrCode} />}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default CreateFormDevice;
