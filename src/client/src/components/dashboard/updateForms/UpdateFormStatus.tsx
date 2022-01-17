import React, {useState} from 'react';
import styled from 'styled-components';
import { Formik, Form, Field } from 'formik'
import * as yup from "yup";
import { useMutation } from '@apollo/client';
import { Button, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField } from '@material-ui/core';
import { GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION, TOTAL_DEVICE_STATUSES_BY_NAME, UPDATE_DEVICE_STATUS } from '../../../graphql/deviceStatuses';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3rem 0;
`;


interface UpdateFormStatusProps {
  selectedRow: any
  open: boolean,
  handleClose: () => void
}


const validationSchema = yup.object({
  name: yup.string().min(1).required("Required"),
})




const UpdateFormStatus = ({selectedRow, open, handleClose}: UpdateFormStatusProps) => {
  
  const [updateDeviceStatus] = useMutation(UPDATE_DEVICE_STATUS);


  console.log("row", selectedRow)
  return (
    <Dialog 
      fullWidth
      open={open}
      onClose={handleClose}
    >
      <>
        <DialogTitle>
          Update {selectedRow.firstName} {selectedRow.lastName}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: selectedRow.name,
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              try {
                console.log("update");
                await updateDeviceStatus({
                  variables: {
                    id: selectedRow.id,
                    name: values.name
                  }, 
                  refetchQueries: [
                    {
                      query: GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION,
                      variables: {
                        name: "",
                        offset: 0,
                        limit: 10
                      }
                    },
                    {
                      query: 
                      TOTAL_DEVICE_STATUSES_BY_NAME,
                      variables: {
                        name: "",
                      }
                    }
                  ]
                });
                console.log("done");
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
              errors
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
                      onChange={(e) => {setFieldValue("name", e.target.value)}}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                </Grid>
                <ButtonContainer>
                  <Button
                    // type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={isSubmitting}
                    onClick={submitForm}
                    style={{
                      backgroundColor: '#F58732',
                      marginRight: '3rem'
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant='outlined'
                    size='large'
                    fullWidth
                    style={{
                      borderColor: '#ED0034',
                      borderWidth: '2px' 
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
  )
}

export default UpdateFormStatus;

