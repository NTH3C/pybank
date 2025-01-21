import React, { useEffect, useState } from "react";
import api from "../api";

const Transaction = () => {
	const [receivedTransactions, setReceivedTransactions] = useState([]);
	const [sentTransactions, setSentTransactions] = useState([]);

	const fetchAllTransactions = async () => {
		try {
			const response = await api.get("/5/transactions");
			setReceivedTransactions(response.data.received_transactions);
			setSentTransactions(response.data.sent_transactions);
		} catch (error) {
			console.error("Error fetching transactions", error);
		}
	};

	useEffect(() => {
		fetchAllTransactions();
	}, []);

	return (
		<div className="bg-slate-200">
			<h1>Transactions</h1>

			<h2>Sent transactions</h2>
			<ul>
				{sentTransactions && sentTransactions.length > 0 ? (
					sentTransactions.map((transaction, index) => (
						<li key={index}>{JSON.stringify(transaction)}</li>
					))
				) : (
					<p>No results</p>
				)}
			</ul>

			<h2>Received transactions</h2>
			<ul>
				{receivedTransactions && receivedTransactions.length > 0 ? (
					receivedTransactions.map((transaction, index) => (
						<li key={index}>{JSON.stringify(transaction)}</li>
					))
				) : (
					<p>No results</p>
				)}
			</ul>
		</div>
	);
};

export default Transaction;
