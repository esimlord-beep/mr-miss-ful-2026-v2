const { data, error } = await adminSupabase
  .from("support_messages")
  .select("*")
  .limit(1);

console.log(data);
console.log(error);

return NextResponse.json({ data, error });
