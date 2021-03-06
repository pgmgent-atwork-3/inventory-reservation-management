import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AdminLayout from "../layouts/AdminLayout";
import Table from "../components/dashboard/Table";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GridCellParams, MuiEvent } from "@mui/x-data-grid";
import ConfirmDialog from "../components/dashboard/dialogs/ConfirmDialog";
import SearchBar from "material-ui-search-bar";
import Loading from "../components/dashboard/Loading";
import { Button } from "@material-ui/core";
import {
  GET_ALL_TAGS_BY_NAME_WITH_PAGINATION,
  REMOVE_TAG,
  SOFT_REMOVE_TAG,
  TOTAL_TAGS_BY_NAME,
} from "../graphql/tags";
import { columnsTag } from "../components/dashboard/columns/columnsTag";
import UpdateFormTag from "../components/dashboard/updateForms/UpdateFormTag";
import CreateFormTag from "../components/dashboard/createForms/CreateFormTag";
import { Snackbar, Alert } from "@mui/material";

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
  action: string;
}

type ActionType = { action: "softDelete" } | { action: "delete" };

const initialState = { action: "" };
function actionReducer(state: initState, action: ActionType): initState {
  switch (action.action) {
    case "softDelete":
      return { action: "softDelete" };
    case "delete":
      return { action: "delete" };
    default:
      return state;
  }
}

const DashboardTags = () => {
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

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSuccess, setSnackbarSuccess] = useState(true);

  const handleSnackbarMessageChange = (isSelected: string) => {
    setSnackbarMessage(isSelected);
  };
  const handleOpenSnackbarChange = (isSelected: boolean) => {
    setOpenSnackbar(isSelected);
  };
  const handleSnackbarSuccessChange = (isSelected: boolean) => {
    setSnackbarSuccess(isSelected);
  };

  const handleSnackbarClose = (
    e: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const { data: totalData } = useQuery(TOTAL_TAGS_BY_NAME, {
    variables: {
      name: searchValue,
    },
  });
  const [getTagsByNameWithPagination, { error, loading, data }] = useLazyQuery(
    GET_ALL_TAGS_BY_NAME_WITH_PAGINATION
  );
  const [softDeleteTag] = useMutation(SOFT_REMOVE_TAG);
  const [deleteTag] = useMutation(REMOVE_TAG);

  useEffect(() => {
    getTagsByNameWithPagination({
      variables: {
        name: searchValue,
        offset: page * 10,
        limit: 10,
      },
    });
  }, [getTagsByNameWithPagination, page, searchValue]);

  const currentlySelectedRow = (
    params: GridCellParams,
    event: MuiEvent<React.MouseEvent>
  ) => {
    const { field } = params;

    if (field !== "edit" && field !== "delete" && field !== "softDelete") {
      return;
    }

    if (
      field === "edit" &&
      event.target instanceof Element &&
      (event.target.tagName === "BUTTON" ||
        event.target.tagName === "svg" ||
        event.target.tagName === "path")
    ) {
      setSelectedRow(params.row);
      setIsOpen(true);
    } else if (
      field === "softDelete" &&
      event.target instanceof Element &&
      (event.target.tagName === "BUTTON" ||
        event.target.tagName === "svg" ||
        event.target.tagName === "path")
    ) {
      setSelectedRow(params.row);
      setIsOpenDialog(true);
      setTitle("Confirm soft delete of this tag");
      setMessage("Are you sure you want to soft delete this tag?");
      dispatch({ action: "softDelete" });
    } else if (
      field === "delete" &&
      event.target instanceof Element &&
      (event.target.tagName === "BUTTON" ||
        event.target.tagName === "svg" ||
        event.target.tagName === "path")
    ) {
      setSelectedRow(params.row);
      setIsOpenDialog(true);
      setTitle("Confirm delete of this tag");
      setMessage(
        "Are you sure you want to delete this tag? The data of this tag will be lost for ever."
      );
      dispatch({ action: "delete" });
    }
  };

  const softDeleteCurrentTag = async (id: string) => {
    try {
      await softDeleteTag({
        variables: {
          id: id,
        },
        refetchQueries: [
          {
            query: GET_ALL_TAGS_BY_NAME_WITH_PAGINATION,
            variables: {
              name: searchValue,
              offset: page * 10,
              limit: 10,
            },
          },
          {
            query: TOTAL_TAGS_BY_NAME,
            variables: {
              name: searchValue,
            },
          },
        ],
      });
      setSnackbarSuccess(true);
      setSnackbarMessage("Tag is deleted!");
      setOpenSnackbar(true);
      handleClose();
    } catch (error) {
      setSnackbarSuccess(false);
      setSnackbarMessage(`Tag is not deleted due to error: ${error}`);
      setOpenSnackbar(true);
    }
  };

  const deleteCurrentTag = async (id: string) => {
    try {
      await deleteTag({
        variables: {
          id: id,
        },
        refetchQueries: [
          {
            query: GET_ALL_TAGS_BY_NAME_WITH_PAGINATION,
            variables: {
              name: searchValue,
              offset: page * 10,
              limit: 10,
            },
          },
          {
            query: TOTAL_TAGS_BY_NAME,
            variables: {
              name: searchValue,
            },
          },
        ],
      });
      setSnackbarSuccess(true);
      setSnackbarMessage("Tag is deleted for ever!");
      setOpenSnackbar(true);
      handleClose();
    } catch (error) {
      setSnackbarSuccess(false);
      setSnackbarMessage(`Tag is not deleted due to error: ${error}`);
      setOpenSnackbar(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsOpenDialog(false);
    setIsOpenCreate(false);
  };

  return (
    <AdminLayout>
      <Title>All Tags</Title>

      <SearchContainer>
        <h2>Search on name:</h2>
        <SearchButtonContainer>
          <SearchBar
            value={searchChange}
            onChange={(newValue) => {
              setSearchChange(newValue);
            }}
            onRequestSearch={() => setSearchValue(searchChange)}
          />
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsOpenCreate(true)}
            style={{
              backgroundColor: "#F58732",
            }}
          >
            Create
          </Button>
        </SearchButtonContainer>
      </SearchContainer>

      {loading && <Loading />}
      {error && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={true}
          autoHideDuration={3000}
        >
          <Alert severity="error">An error occured: {error.message}</Alert>
        </Snackbar>
      )}
      {data && totalData && (
        <Table
          data={data.tagsByNameWithPagination}
          columns={columnsTag}
          onCellClick={currentlySelectedRow}
          total={totalData.totalTagByName}
          page={page}
          setPage={setPage}
        />
      )}

      {isOpen && (
        <UpdateFormTag
          selectedRow={selectedRow}
          handleClose={handleClose}
          open={isOpen}
          page={page}
          name={searchValue}
          onSnackbarMessageChange={handleSnackbarMessageChange}
          onOpenSnackbarChange={handleOpenSnackbarChange}
          onSnackbarSuccessChange={handleSnackbarSuccessChange}
        />
      )}

      {isOpenCreate && (
        <CreateFormTag
          handleClose={handleClose}
          open={isOpenCreate}
          page={page}
          name={searchValue}
          onSnackbarMessageChange={handleSnackbarMessageChange}
          onOpenSnackbarChange={handleOpenSnackbarChange}
          onSnackbarSuccessChange={handleSnackbarSuccessChange}
        />
      )}

      {isOpenDialog && (
        <ConfirmDialog
          selectedRow={selectedRow}
          title={title}
          message={message}
          open={isOpenDialog}
          handleClose={handleClose}
          handleConfirm={
            state.action === "softDelete"
              ? softDeleteCurrentTag
              : deleteCurrentTag
          }
        />
      )}

      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          severity={snackbarSuccess ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default DashboardTags;
