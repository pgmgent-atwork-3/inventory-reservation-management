import React, { useState, useReducer, useEffect } from 'react';
import styled from "styled-components";
import AdminLayout from '../layouts/AdminLayout';
import Table from "../components/dashboard/Table";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GridCellParams, MuiEvent } from "@mui/x-data-grid";
import UpdateFormDeviceStatus from '../components/dashboard/updateForms/UpdateFormStatus';
import ConfirmDialog from '../components/dashboard/dialogs/ConfirmDialog';
import SearchBar from 'material-ui-search-bar';
import Loading from '../components/dashboard/Loading';
import { columnsDeviceStatus } from '../components/dashboard/columns/columnsDeviceStatus';
import { GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION,  REMOVE_DEVICE_STATUS, SOFT_REMOVE_DEVICE_STATUS, TOTAL_DEVICE_STATUSES_BY_NAME, UPDATE_DEVICE_STATUS } from '../graphql/deviceStatuses';
import { Button } from '@material-ui/core';
import CreateFormDeviceStatus from '../components/dashboard/createForms/CreateFormDeviceStatus';


const Title = styled.h1`
  margin: 1.5rem;
`;

const SearchContainer = styled.div`
  margin: 0 1.5rem;

  h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
`;

const SearchButtonContainer = styled.div`
  display: flex; 
  justify-content: space-between;
  align-items: center;

  div {
    width: 100%;
  }

  button {
    margin-left: 3rem;
  }
`;

interface initState {
  action: string
}


type ActionType = 
  | { action: "softDelete" }
  | { action: "delete" }

const initialState = { action: "" }
function actionReducer (state: initState, action: ActionType): initState {
  switch (action.action) {
    case 'softDelete':
      return { action: "softDelete" };
    case 'delete':
      return { action: "delete" };
    default:
      return state;  
  }
}


const DashboardStatuses = () => {
  const [selectedRow, setSelectedRow] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [searchChange, setSearchChange] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [state, dispatch] = React.useReducer(actionReducer, initialState);

  const {data: totalData} = useQuery(TOTAL_DEVICE_STATUSES_BY_NAME, {
    variables: {
      name: searchValue
    }
  });
  const [getDeviceStatusesByNameWithPagination, { error, loading, data }] = useLazyQuery(GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION);
  const [updateDeviceStatus] = useMutation(UPDATE_DEVICE_STATUS);
  const [softDeleteDeviceStatus] = useMutation(SOFT_REMOVE_DEVICE_STATUS);
  const [deleteDeviceStatus] = useMutation(REMOVE_DEVICE_STATUS);



  useEffect(() => {
    getDeviceStatusesByNameWithPagination({
      variables: {
        name: searchValue,
        offset: page * 10,
        limit: 10
      }
    })

  }, [page, searchValue])


  const currentlySelectedRow = (
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent>
  ) => {
    const { field } = params;

    if (field !== "edit" && field !== "delete" && field !== "softDelete" ) {
      return;
    }

    console.log("tag", event.target instanceof Element ? event.target.tagName : "nope")
    if (field === "edit" && event.target instanceof Element && (event.target.tagName === "BUTTON" || event.target.tagName === "svg" || event.target.tagName === "path")) {
      setSelectedRow(params.row);
      setIsOpen(true);
    } else if (field === "softDelete" && event.target instanceof Element && (event.target.tagName === "BUTTON" || event.target.tagName === "svg" || event.target.tagName === "path")){
      console.log("ano");
      setSelectedRow(params.row);
      setIsOpenDialog(true);
      setTitle("Confirm soft delete of this device status");
      setMessage("Are you sure you want to soft delete this device status?");
      dispatch({ action: "softDelete" })
    } else if (field === "delete" && event.target instanceof Element && (event.target.tagName === "BUTTON" || event.target.tagName === "svg" || event.target.tagName === "path")){
      console.log("ano");
      setSelectedRow(params.row);
      setIsOpenDialog(true);
      setTitle("Confirm delete of this device status");
      setMessage("Are you sure you want to delete this device status? The data of this device status will be lost for ever.");
      dispatch({ action: "delete" })
    }
  };



  const softDeleteCurrentDeviceStatus = async (id:string) => {
    try {
      await softDeleteDeviceStatus({
        variables: {
          id: id,
        }, 
        refetchQueries: [
          {
            query: GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION,
            variables: {
              name: searchValue,
              offset: page * 10,
              limit: 10
            }
          },
          {
            query: 
            TOTAL_DEVICE_STATUSES_BY_NAME,
            variables: {
              name: searchValue,
            }
          }
        ]
      });
      handleClose();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteCurrentDeviceStatus = async (id:string) => {
    try {
      await deleteDeviceStatus({
        variables: {
          id: id,
        }, 
        refetchQueries: [
          {
            query: GET_ALL_DEVICE_STATUSES_BY_NAME_WITH_PAGINATION,
            variables: {
              name: searchValue,
              offset: page * 10,
              limit: 10
            }
          },
          {
            query: 
            TOTAL_DEVICE_STATUSES_BY_NAME,
            variables: {
              name: searchValue,
            }
          }
        ]
      });
      handleClose();
    } catch (error) {
      console.log(error);
    }
  }
  
  const handleClose = () => {
    console.log("close");
    setIsOpen(false);
    setIsOpenDialog(false);
    setIsOpenCreate(false);
  }

  return (
    <AdminLayout>
      <Title>All Device Statuses</Title>

      <SearchContainer>
        <h2>Search on name:</h2>
        <SearchButtonContainer>  
          <SearchBar
            value={searchChange}
            onChange={(newValue) => {
              setSearchChange(newValue)
            }}
            onRequestSearch={() => setSearchValue(searchChange)}
          />

        </SearchButtonContainer>
      </SearchContainer>

      {loading && (<Loading />)}
      {error && (<p>{error.message}</p>)}
      {data && totalData && <Table  data={data.deviceStatusesByNameWithPagination} columns={ columnsDeviceStatus} onCellClick={currentlySelectedRow} total={totalData.totalDeviceStatusesByName}
      page={page}
      setPage={setPage}
      />}

      {isOpen && (
        <UpdateFormDeviceStatus
          selectedRow={selectedRow}
          handleClose={handleClose}
          open={isOpen}
        />
      )}


      {isOpenDialog && (
        <ConfirmDialog
          selectedRow={selectedRow}
          title={title}
          message={message}
          open={isOpenDialog}
          handleClose={handleClose}
          handleConfirm={ state.action === 'softDelete' ? softDeleteCurrentDeviceStatus : deleteCurrentDeviceStatus}
        />
      )}


    </AdminLayout>

  )
}

export default DashboardStatuses;

