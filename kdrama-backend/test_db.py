"""Simple PostgreSQL smoke test for local development."""

from contextlib import closing

from app.core.database import get_psycopg_connection


def test_full_database() -> None:
    with closing(get_psycopg_connection()) as connection:
        with connection.cursor() as cursor:
            print("Connected to PostgreSQL.\n")

            cursor.execute(
                """
                SELECT start_year, COUNT(*)
                FROM public.dramas
                GROUP BY start_year
                ORDER BY start_year DESC
                LIMIT 3
                """
            )
            print("--- Movie Statistics by Year ---")
            for year, total in cursor.fetchall():
                print(f"Year {year}: {total} films")

            print("\n--- Scoring Tables ---")
            cursor.execute("SELECT COUNT(*) FROM scoring_data.actor_scores")
            print(f"Actors: {cursor.fetchone()[0]}")

            cursor.execute("SELECT COUNT(*) FROM scoring_data.director_scores")
            print(f"Directors: {cursor.fetchone()[0]}")

            cursor.execute("SELECT COUNT(*) FROM scoring_data.writer_scores")
            print(f"Screenwriters: {cursor.fetchone()[0]}")

    print("\nDatabase is ready for the API.")


if __name__ == "__main__":
    test_full_database()
