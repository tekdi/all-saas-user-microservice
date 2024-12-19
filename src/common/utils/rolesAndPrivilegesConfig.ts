export class RolesAndPrivilegesConfig {
    // List of roles
    public static readonly ROLES = [
        { "title": "tenant admin" },
        { "title": "cohort admin" },
        { "title": "learner" }
    ];

    // List of privileges mapped to roles
    public static readonly PRIVILEGES = {
        "tenant_admin": [
            "1e0aca73-ddaf-4288-a64f-9e30675422d1",
            "22df5767-d64c-4ead-a520-ca12553c729d",
            "3cb9189c-076f-42b6-808c-9b8eb33fa0b8",
            "4e53e4fc-3c78-476b-bfd9-8cfdb81aaea4",
            "835c0038-f842-4c70-aa15-c475f278bff8",
            "89a619b1-c84a-4a3d-a379-1a21089cf807",
            "a17a1e49-9098-4852-8043-fe79d9f85334",
            "c83efca3-0f07-436a-ba9d-0d901759965e",
            "d96db95b-e380-44e5-91ee-b5941a914a8e",
            "e503383e-98f2-47d5-8376-caac51716b46",
            "e64561a3-0991-4aa4-9e7c-2490b775041c",
            "e76037bb-2af8-4437-a250-7ce62d3c66da",
            "fedab7c5-0897-47fc-85c7-8d63e75bc63b"
          ],
        "cohort_admin": [
            "1e0aca73-ddaf-4288-a64f-9e30675422d1",
            "22df5767-d64c-4ead-a520-ca12553c729d",
            "3cb9189c-076f-42b6-808c-9b8eb33fa0b8",
            "4e53e4fc-3c78-476b-bfd9-8cfdb81aaea4",
            "835c0038-f842-4c70-aa15-c475f278bff8",
            "a17a1e49-9098-4852-8043-fe79d9f85334",
            "c83efca3-0f07-436a-ba9d-0d901759965e",
            "d96db95b-e380-44e5-91ee-b5941a914a8e",
            "e503383e-98f2-47d5-8376-caac51716b46",
            "e64561a3-0991-4aa4-9e7c-2490b775041c"
          ],
    };
}
