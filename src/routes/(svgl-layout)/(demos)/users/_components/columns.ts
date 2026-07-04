import type { ColumnDef } from "@tanstack/table-core";
import { parse } from "date-fns/parse";

import type { UserRow } from "./data.js";

export const usersColumns: ColumnDef<UserRow>[] = [
	{
		id: "select",
		enableHiding: false,
		enableSorting: false,
	},
	{
		id: "search",
		accessorFn: (row) => `${row.name} ${row.email}`,
		filterFn: "includesString",
		enableHiding: true,
	},
	{
		accessorKey: "name",
		header: "User",
	},
	{
		accessorKey: "role",
		header: "Role / Team",
		filterFn: "equalsString",
	},
	{
		accessorKey: "team",
		header: "Team",
		filterFn: "equalsString",
	},
	{
		accessorKey: "workspace",
		header: "Workspace",
		filterFn: "arrIncludes",
	},
	{
		accessorKey: "status",
		header: "Status",
		filterFn: "equalsString",
	},
	{
		id: "joinedDate",
		accessorFn: (row) => parse(row.joinedDate, "dd MMM yyyy, h:mm a", new Date()).getTime(),
		header: "Joined date",
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
	},
];
