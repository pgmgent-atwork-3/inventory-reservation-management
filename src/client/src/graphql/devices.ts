import { gql } from "@apollo/client";


export const TOTAL_DEVICES_BY_NAME = gql`
query totalDevicesByName($name: String!) {
  totalDevicesByName(name: $name)
}
`;

export const GET_ALL_DEVICES_BY_NAME_WITH_PAGINATION = gql`
  query ($name: String!, $offset: Int!, $limit: Int!){
    devicesByNameWithPagination(name: $name, offset: $offset, limit: $limit) {
      id
      model {
        id
        name
      }
      deviceStatus {
        id
        name
      }
      qr_code
      created_on
      updated_on
    }
  }
`;

export const TOTAL_DEVICES_IN_CHECK_BY_NAME = gql`
query totalDevicesInCheckByName($name: String!) {
  totalDevicesInCheckByName(name: $name)
}
`;

export const GET_ALL_DEVICES_IN_CHECK_BY_NAME_WITH_PAGINATION = gql`
  query ($name: String!, $offset: Int!, $limit: Int!){
    devicesInCheckByNameWithPagination(name: $name, offset: $offset, limit: $limit) {
      id
      model {
        id
        name
      }
      deviceStatus {
        id
        name
      }
      qr_code
      created_on
      updated_on
    }
  }
`;

export const TOTAL_DEVICES = gql`
  query totalDevices {
    totalDevices
  }
`;

export const DIFFERENCE_LAST_MONTH_DEVICES = gql`
  query differenceLastMonthDevices {
    differenceLastMonthDevices
  }
`;

export const RECENT_NEW_DEVICES = gql`
  query recentNewDevices {
    recentNewDevices {
      id
      created_on
      model {
        name
      }
    }
  }
`;

export const GET_ALL_DEVICES = gql`
  query devices {
    devices {
      id
      deviceStatus {
        name
      }
      model {
        name
        brand
        description
        specifications
        max_reservation_time
      }
      created_on
      updated_on
    }
  }
`;

export const GET_ALL_DEVICES_WITH_PAGINATION = gql`
  query ($offset: Int!, $limit: Int!){
    getDeviceById(offset: $offset, limit: $limit) {
      id
      deviceStatus {
        name
      }
      model {
        name
        brand
        description
        specifications
        max_reservation_time
      }
      created_on
      updated_on
    }
  }
`;

export const GET_ALL_STOCK_DEVICES = gql`
  query stockDevices {
    stockDevices {
      id
      deviceStatus {
        name
      }
      model {
        name
        brand
        description
        specifications
        max_reservation_time
      }
      created_on
      updated_on
    }
  }
`;

export const GET_ALL_BORROWED_DEVICES = gql`
  query borrowedDevices {
    borrowedDevices {
      id
      deviceStatus {
        name
      }
      model {
        name
        brand
        description
        specifications
        max_reservation_time
      }
      user {
        firstName
        lastName
      }
      created_on
      updated_on
    }
  }
`;

export const GET_ALL_IN_CHECK_DEVICES = gql`
  query inCheckDevices {
    inCheckDevices {
      id
      model {
        name
        brand
        description
        specifications
        max_reservation_time
      }
      created_on
      updated_on
    }
  }
`;

export const CREATE_DEVICE = gql`

mutation ($modelId: String!, $deviceStatusId: String!, $qr_code: String ) {
  createDevice(createDeviceInput: {
    modelId: $modelId,
    deviceStatusId: $deviceStatusId,
    qr_code: $qr_code,
  }) {
    id
  }
}
`;

export const UPDATE_DEVICE = gql`
mutation ($id: String!, $modelId: String, $deviceStatusId: String, $userId: String, $qr_code: String ) {
  updateDevice(updateDeviceInput: {
    id: $id
    modelId: $modelId,
    deviceStatusId: $deviceStatusId,
    userId: $userId,
    qr_code: $qr_code,
  }) {
    id
  }
}
`;

export const REMOVE_DEVICE = gql`
  mutation ($id: String!){
    removeDevice(id: $id)
  }
`;

export const SOFT_REMOVE_DEVICE = gql`
  mutation ($id: String!){
    softRemoveDevice(id: $id) {
      id
    }
  }
`;

export const GET_DEVICE_BY_ID = gql`
  query ($id: String!){
    getDeviceById(id: $id) {
      id
      userId
      qr_code
      model {
        id
        name
        description
        max_reservation_time
      }
      damages {
        title
        picture 
        description
      }
      reservations {
        userId
        reservationStateId
        start_date
        end_date
        expected_end_date
      }
    }
  }
`;

export const GET_DEVICES_BY_MODELID = gql`
  query ($modelId: String!){
    getDevicesByModelId(modelId: $modelId) {
      id
      qr_code
      damages {
        title
        picture 
        description
      }
    }
  }
`;


export const GET_DEVICES_TOTAL_BY_MODELID = gql`
  query ($modelId: String!) {
    totalDevicesByModelId(modelId: $modelId) {
      total
    }
  }
`;

export const GET_DEVICES_BY_MODELID_WITH_PAGINATION = gql`
query ($modelId: String!, $offset: Int!, $limit: Int!){
  getDevicesByModelIdWithPagination(modelId: $modelId, offset: $offset, limit: $limit) {
    id
    qr_code
    userId
    damages {
      title
      picture 
      description
    }
    model {
      name
    }
  }
}
`;


